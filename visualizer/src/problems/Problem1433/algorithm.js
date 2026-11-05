export const phases = [
  { id: 'start', label: 'Start', description: 'Hold both strings as given. A break needs every position of one arrangement to dominate the other.' },
  { id: 'sort', label: 'Sort both strings', description: 'Sorting each string gives the most favourable arrangement of its letters, smallest to largest.' },
  { id: 'compare', label: 'Compare position', description: 'Check one position in the chosen direction: the letter from the first string must be at least the letter from the second.' },
  { id: 'fail', label: 'Direction fails', description: 'A position breaks the dominance in this direction, so this direction cannot work.' },
  { id: 'done', label: 'Complete', description: 'Report whether either direction dominated at every position.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"first": "abc", "second": "xya"}.')
  const { first, second } = input
  const lower = s => typeof s === 'string' && s.length >= 1 && s.length <= 12 && /^[a-z]+$/.test(s)
  if (!lower(first) || !lower(second) || first.length !== second.length) throw new Error('first and second are lowercase strings of equal length from 1 to 12.')
  return { first, second }
}

export function buildTrace({ first, second }) {
  const a = [...first].sort()
  const b = [...second].sort()
  const frames = [{ phase: 'start', activeLine: L('const a ='), pythonLine: P('a, b = sorted'), snapshot: { a: [...first], b: [...second] }, message: `Compare "${first}" and "${second}" after sorting each one.` }]
  frames.push({ phase: 'sort', activeLine: L('const a ='), pythonLine: P('a, b = sorted'), snapshot: { a, b }, message: `Sorted: ${a.join('')} and ${b.join('')}.` })
  const directions = [{ name: 'first over second', x: a, y: b }, { name: 'second over first', x: b, y: a }]
  let result = false
  for (const dir of directions) {
    let ok = true
    for (let i = 0; i < a.length; i++) {
      const pass = dir.x[i] >= dir.y[i]
      frames.push({ phase: 'compare', activeLine: L('for (let i'), pythonLine: P('if x[i] < y[i]'), snapshot: { a, b, direction: dir.name, index: i, left: dir.x[i], right: dir.y[i], pass }, message: `${dir.name}: position ${i} compares ${dir.x[i]} with ${dir.y[i]}, so ${pass ? 'it holds' : 'it fails'}.` })
      if (!pass) { ok = false; break }
    }
    if (ok) { result = true; break }
    frames.push({ phase: 'fail', activeLine: L('ok = false'), pythonLine: P('if x[i] < y[i]'), snapshot: { a, b, direction: dir.name, failed: true }, message: `${dir.name} is not a valid break.` })
  }
  frames.push({ phase: 'done', activeLine: L('return false'), pythonLine: P('return False'), snapshot: { a, b, result }, message: result ? 'One arrangement dominates the other, so a break exists.' : 'Neither direction dominates, so no break exists.' })
  return { input: { first, second }, result, frames }
}

export const code = `function checkIfCanBreak(first, second) {
  const a = [...first].sort()
  const b = [...second].sort()
  for (const [x, y] of [[a, b], [b, a]]) {
    let ok = true
    for (let i = 0; i < a.length; i++) {
      if (x[i] < y[i]) ok = false
    }
    if (ok) return true
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_if_can_break(s1, s2):
    a, b = sorted(s1), sorted(s2)
    for x, y in [(a, b), (b, a)]:
        ok = True
        for i in range(len(a)):
            if x[i] < y[i]: ok = False


        if ok: return True

    return False
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
