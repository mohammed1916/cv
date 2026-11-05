const LOWER = /^[a-z]+$/

export function parseInput(text) {
  const data = JSON.parse(text)
  const { s1, s2, baseStr } = data ?? {}
  if (typeof s1 !== 'string' || typeof s2 !== 'string' || s1.length < 1 || s1.length > 8 || s1.length !== s2.length || !LOWER.test(s1) || !LOWER.test(s2)) throw new Error('s1 and s2 are lowercase strings of the same length, from 1 to 8.')
  if (typeof baseStr !== 'string' || baseStr.length < 1 || baseStr.length > 10 || !LOWER.test(baseStr)) throw new Error('baseStr is a lowercase string of 1 to 10 letters.')
  return { s1, s2, baseStr }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function smallestEquivalentString(s1, s2, baseStr) {', 'def smallest_equivalent(s1, s2, baseStr):'],
  ['  const parent = Array.from({ length: 26 }, (_, i) => i)', '    parent = list(range(26))'],
  ['  const find = x => {', '    def find(x):'],
  ['    while (parent[x] !== x) x = parent[x]', '        while parent[x] != x: x = parent[x]'],
  ['    return x', '        return x'],
  ['  }', ''],
  ['  for (let i = 0; i < s1.length; i++) {', '    for x, y in zip(s1, s2):'],
  ['    const a = s1.charCodeAt(i) - 97; const b = s2.charCodeAt(i) - 97', '        a, b = ord(x) - 97, ord(y) - 97'],
  ['    const ra = find(a); const rb = find(b)', '        ra, rb = find(a), find(b)'],
  ['    if (ra !== rb) { if (ra < rb) parent[rb] = ra; else parent[ra] = rb }', '        if ra != rb: parent[max(ra, rb)] = min(ra, rb)'],
  ['  }', ''],
  ['  return [...baseStr].map(c => String.fromCharCode(97 + find(c.charCodeAt(0) - 97))).join("")', "    return ''.join(chr(find(ord(c) - 97) + 97) for c in baseStr)"],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ s1, s2, baseStr }) {
  const parent = Array.from({ length: 26 }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const letter = i => String.fromCharCode(97 + i)
  const roots = () => Array.from({ length: 26 }, (_, i) => letter(find(i)))
  const frames = [{ phase: 'start', pythonLine: P('parent = list'), activeLine: L('const parent'), pair: null, merged: 0, roots: roots(), message: 'Every letter starts as its own group.' }]
  for (let i = 0; i < s1.length; i++) {
    const a = s1.charCodeAt(i) - 97
    const b = s2.charCodeAt(i) - 97
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) { if (ra < rb) parent[rb] = ra; else parent[ra] = rb }
    frames.push({ phase: 'merge', pythonLine: P('if ra != rb'), activeLine: L('if (ra !== rb)'), pair: [s1[i], s2[i]], merged: i + 1, roots: roots(), message: `Join ${s1[i]} and ${s2[i]}; the smaller letter is the representative.` })
  }
  const result = [...baseStr].map(c => letter(find(c.charCodeAt(0) - 97))).join('')
  frames.push({ phase: 'done', pythonLine: P("return ''.join"), activeLine: L('return [...baseStr]'), pair: null, merged: s1.length, roots: roots(), message: `Mapped base string: ${result}.` })
  return { input: { s1, s2, baseStr }, result, frames }
}
