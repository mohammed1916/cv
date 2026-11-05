// LeetCode 1930: a length-3 palindrome is x y x. For each letter x with first and last occurrences far enough apart, count the distinct letters strictly between them.
const SOURCE = [
  "function countPalindromicSubsequence(s) {",
  "  let total = 0",
  "  for (const x of 'abcdefghijklmnopqrstuvwxyz') {",
  "    const first = s.indexOf(x)",
  "    const last = s.lastIndexOf(x)",
  "    if (first === -1 || last - first < 2) continue",
  "    const inside = new Set(s.slice(first + 1, last))",
  "    total += inside.size",
  "  }",
  "  return total",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_palindromic_subsequence(s):
    total = 0
    for c in "abcdefghijklmnopqrstuvwxyz":
        first = s.find(c)
        last = s.rfind(c)
        if first != -1 and last - first >= 2:
            total += len(set(s[first + 1:last]))
    return total
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'letters', label: 'Each letter', description: 'Find the outer pair of each letter and the letters between them.' },
  { id: 'done', label: 'Result', description: 'Total number of distinct palindromes.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,30}$/.test(s)) throw new Error('Enter 1 to 30 lowercase letters.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = []
  let total = 0
  const letters = [...new Set(s)].sort()
  for (const x of 'abcdefghijklmnopqrstuvwxyz') {
    const first = s.indexOf(x)
    const last = s.lastIndexOf(x)
    if (first === -1 || last - first < 2) {
      frames.push({ phase: 'letters', activeLine: L('if (first === -1'), pythonLine: P('if first != -1'), message: `${x}: no letter sits strictly inside its outer pair.`, letter: x, first, last, inside: [], total, letters })
      continue
    }
    const inside = [...new Set(s.slice(first + 1, last))].sort()
    total += inside.length
    frames.push({ phase: 'letters', activeLine: L('const inside ='), pythonLine: P('total += len'), message: `${x} at ${first} and ${last}: ${inside.length} distinct letter(s) between them (${inside.join(', ')}).`, letter: x, first, last, inside, total, letters })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), message: `${total} distinct palindromes of length 3.`, letter: null, first: -1, last: -1, inside: [], total, letters })
  return { input: { s }, result: total, frames }
}
