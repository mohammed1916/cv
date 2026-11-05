export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with word.')
  const { word } = data
  if (typeof word !== 'string' || word.length < 1 || word.length > 30) throw new Error('word is a string of 1 to 30 capital letters.')
  if (!/^[A-Z]+$/.test(word)) throw new Error('word may contain only capital letters A to Z.')
  return { word }
}

// Letters sit on a keyboard with six columns: A B C D E F / G H ... / Y Z.
const dist = (a, b) => Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) + Math.abs((a % 6) - (b % 6))
const label = k => (k < 0 ? '(none)' : String.fromCharCode(65 + k))

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function minimumDistance(word) {', 'def minimum_distance(word):'],
  ['  const dist = (a, b) => Math.abs(Math.floor(a / 6) - Math.floor(b / 6)) + Math.abs((a % 6) - (b % 6))', '    def dist(a, b): ra, ca = divmod(a, 6); rb, cb = divmod(b, 6); return abs(ra - rb) + abs(ca - cb)'],
  ['  const letters = [...word].map(ch => ch.charCodeAt(0) - 65)', '    letters = [ord(ch) - 65 for ch in word]'],
  ['  const n = letters.length; const memo = new Map()', '    n = len(letters); memo = {}'],
  ['  const best = (i, other) => {', '    def best(i, other):'],
  ['    if (i >= n) return 0', '        if i >= n: return 0'],
  ['    if (memo.has(`${i}:${other}`)) return memo.get(`${i}:${other}`)', '        if (i, other) in memo: return memo[(i, other)]'],
  ['    const previous = letters[i - 1]', '        previous = letters[i - 1]'],
  ['    const one = dist(previous, letters[i]) + best(i + 1, other)', '        one = dist(previous, letters[i]) + best(i + 1, other)'],
  ['    const two = (other < 0 ? 0 : dist(other, letters[i])) + best(i + 1, previous)', '        two = (0 if other < 0 else dist(other, letters[i])) + best(i + 1, previous)'],
  ['    const value = Math.min(one, two); memo.set(`${i}:${other}`, value); return value', '        memo[(i, other)] = min(one, two); return memo[(i, other)]'],
  ['  }', ''],
  ['  return best(1, -1)', '    return best(1, -1)'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { word } = input
  const letters = [...word].map(ch => ch.charCodeAt(0) - 65)
  const n = letters.length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('const letters'), pythonLine: P('letters = [ord'), index: 1, other: -1, memo: [], message: 'The first letter goes on a free finger at no cost. The other finger is unused.' }]

  const best = (i, other) => {
    if (i >= n) return 0
    const key = `${i}:${other}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if (memo.has'), pythonLine: P('if (i, other) in memo'), index: i, other, memo: snapshot(), message: `Typing from letter ${i} with the other finger on ${label(other)} is already known to cost ${value}.` })
      return value
    }
    const previous = letters[i - 1]
    frames.push({ phase: 'visit', activeLine: L('const previous'), pythonLine: P('previous = letters'), index: i, other, memo: snapshot(), message: `Letter ${i} is ${label(letters[i])}. The finger on ${label(previous)} or the other finger (${label(other)}) types it.` })
    const one = dist(previous, letters[i]) + best(i + 1, other)
    const two = (other < 0 ? 0 : dist(other, letters[i])) + best(i + 1, previous)
    const value = Math.min(one, two)
    memo.set(key, value)
    entries.push({ index: i, other, value })
    frames.push({ phase: 'store', activeLine: L('const value = Math.min'), pythonLine: P('memo[(i, other)] = min'), index: i, other, memo: snapshot(), message: `Best cost from letter ${i} is ${value}.` })
    return value
  }

  const result = best(1, -1)
  frames.push({ phase: 'done', activeLine: L('return best(1, -1)'), pythonLine: P('return best(1, -1)'), index: null, other: -1, memo: snapshot(), message: `Minimum distance to type ${word}: ${result}.` })
  return { input, result, frames }
}
