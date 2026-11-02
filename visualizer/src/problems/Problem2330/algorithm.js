// LeetCode 2330: Valid Palindrome IV.
// Each mismatched mirror pair (s[i], s[n-1-i]) needs at least one changed character, and one change
// can fix exactly one pair. So the string can be fixed with at most two changes exactly when it has at most two mismatched pairs.

const MAX_LEN = 20

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,20}$/.test(s)) throw new Error(`Enter 1 to ${MAX_LEN} lowercase letters. The visualization caps the length at ${MAX_LEN}.`)
  return { s }
}

export const code = `FUNCTION canFixWithTwo(s)
    n ← len(s); mismatches ← 0
    FOR each i from 0 to floor(n / 2) - 1
        j ← n - 1 - i
        IF s[i] is not equal to s[j] THEN mismatches ← mismatches + 1
    RETURN mismatches is at most 2`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_make_palindrome(s):
    n = len(s)
    mismatches = 0
    for i in range(n // 2):
        j = n - 1 - i
        if s[i] != s[j]:
            mismatches += 1
    return mismatches <= 2
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Pairs', description: 'Mirror positions are paired from the outside in.' },
  { id: 'pair', label: 'Pair', description: 'Compare one mirror pair.' },
  { id: 'done', label: 'Result', description: 'Mismatches against the budget of two changes.' },
]

export function buildTrace({ s }) {
  const n = s.length
  const frames = []
  let mismatches = 0
  frames.push({ phase: 'start', activeLine: L('n ← len(s)'), pythonLine: P('n = len(s)'), message: `${n} characters: ${Math.floor(n / 2)} mirror pair${Math.floor(n / 2) === 1 ? '' : 's'} to check.`, i: -1, j: -1, match: null, mismatches, pairsDone: [] })
  const pairsDone = []
  for (let i = 0; i < Math.floor(n / 2); i++) {
    const j = n - 1 - i
    const match = s[i] === s[j]
    if (!match) mismatches++
    pairsDone.push({ i, j, match })
    frames.push({ phase: 'pair', activeLine: L(match ? 'IF s[i] is not equal' : 'IF s[i] is not equal'), pythonLine: P(match ? 'if s[i] != s[j]' : 'if s[i] != s[j]'), message: match ? `s[${i}] = ${s[i]} matches s[${j}] = ${s[j]}.` : `s[${i}] = ${s[i]} and s[${j}] = ${s[j]} differ: one change needed. Mismatches ${mismatches}.`, i, j, match, mismatches, pairsDone: pairsDone.slice() })
  }
  const result = mismatches <= 2
  frames.push({ phase: 'done', activeLine: L('RETURN mismatches'), pythonLine: P('return mismatches <= 2'), message: result ? `${mismatches} mismatched pair${mismatches === 1 ? '' : 's'}: at most two changes are enough.` : `${mismatches} mismatched pairs need more than two changes.`, i: -1, j: -1, match: null, mismatches, pairsDone: pairsDone.slice(), result })
  return { input: { s }, result, frames }
}
