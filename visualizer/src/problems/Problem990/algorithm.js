// First merge every pair of variables that must be equal, using union-find over the 26 letters. Then every
// inequality must join two variables that landed in different groups. An inequality inside one group is a conflict.
export const code = String.raw`function equationsPossible(equations) {
  const parent = Array.from({ length: 26 }, (_, i) => i); // one node per lowercase letter
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const at = ch => ch.charCodeAt(0) - 97;
  for (const eq of equations) {
    if (eq[1] === '=') parent[find(at(eq[0]))] = find(at(eq[3])); // equal variables share a group
  }
  for (const eq of equations) {
    if (eq[1] === '!' && find(at(eq[0])) === find(at(eq[3]))) return false; // forced equal, yet declared different
  }
  return true;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def equations_possible(equations):
    parent = list(range(26))  # one node per lowercase letter
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for eq in equations:
        if eq[1] == "=":
            parent[find(ord(eq[0]) - 97)] = find(ord(eq[3]) - 97)  # equal variables share a group
    for eq in equations:
        if eq[1] == "!" and find(ord(eq[0]) - 97) == find(ord(eq[3]) - 97):
            return False  # forced equal, yet declared different
    return True`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'unite', label: 'Merge equal', description: 'Put every pair of equal variables into one group.' },
  { id: 'check', label: 'Check unequal', description: 'Each inequality must join two different groups.' },
  { id: 'done', label: 'Verdict', description: 'Whether every equation can hold together.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const equations = input && input.equations
  if (!Array.isArray(equations) || equations.length < 1 || equations.length > 12) throw new Error('Use equations: a list of 1 to 12 strings like "a==b" or "c!=d".')
  for (const eq of equations) {
    if (typeof eq !== 'string' || !/^[a-z][=!]=[a-z]$/.test(eq)) throw new Error('Each equation must look like "a==b" or "a!=b", with lowercase letters.')
  }
  return { equations }
}

export function buildTrace({ equations }) {
  const parent = Array.from({ length: 26 }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const at = ch => ch.charCodeAt(0) - 97
  const letter = i => String.fromCharCode(97 + i)
  const groups = () => {
    const map = new Map()
    for (const i of new Set(equations.flatMap(eq => [at(eq[0]), at(eq[3])]))) {
      const root = find(i)
      if (!map.has(root)) map.set(root, [])
      map.get(root).push(letter(i))
    }
    return [...map.values()].map(list => list.sort())
  }
  const frames = []
  for (const eq of equations.filter(e => e[1] === '=')) {
    parent[find(at(eq[0]))] = find(at(eq[3]))
    frames.push({ phase: 'unite', activeLine: L('parent[find(at(eq[0]))]'), pythonLine: PY('parent[find(ord(eq[0]) - 97)] = find(ord(eq[3])'), equation: eq, status: 'merged', groups: groups(), conflict: null, verdict: null,
      message: `${eq} puts ${eq[0]} and ${eq[3]} into one group.` })
  }
  let verdict = true
  for (const eq of equations.filter(e => e[1] === '!')) {
    const clash = find(at(eq[0])) === find(at(eq[3]))
    frames.push({ phase: clash ? 'done' : 'check', activeLine: L(clash ? 'return false' : 'if (eq[1] === \'!\''), pythonLine: PY(clash ? 'return False' : 'if eq[1] == "!"'), equation: eq, status: clash ? 'conflict' : 'ok', groups: groups(), conflict: clash ? eq : null, verdict: clash ? false : null,
      message: clash ? `${eq} says ${eq[0]} and ${eq[3]} differ, but they are already in the same group. No assignment works.`
        : `${eq} holds: ${eq[0]} and ${eq[3]} are in different groups.` })
    if (clash) { verdict = false; break }
  }
  if (verdict) frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: PY('return True'), equation: null, status: 'ok', groups: groups(), conflict: null, verdict: true, message: 'Every inequality joins different groups, so the equations can all hold.' })
  return { input: { equations }, result: verdict, frames }
}
