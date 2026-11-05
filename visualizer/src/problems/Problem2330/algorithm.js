const MAX_LEN = 20

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,20}$/.test(s)) throw new Error(`Enter 1 to ${MAX_LEN} lowercase letters. The visualization caps the length at ${MAX_LEN}.`)
  return { s }
}

export const code = `function canMakePalindrome(s) {
  let l = 0;
  let r = s.length - 1;
  let mismatches = 0;
  while (l < r) {
    if (s[l] !== s[r]) mismatches++;
    l++;
    r--;
  }
  return mismatches <= 2;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def can_make_palindrome(s):
    l = 0
    r = len(s) - 1
    mismatches = 0
    while l < r:
        if s[l] != s[r]:
            mismatches += 1
        l += 1
        r -= 1
    return mismatches <= 2
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Pointers', description: 'Put l on the first letter and r on the last.' },
  { id: 'pair', label: 'Pair', description: 'Compare the letters that l and r point to.' },
  { id: 'done', label: 'Result', description: 'Compare the mismatch count with the two changes allowed.' },
]

export function buildTrace({ s }) {
  const n = s.length
  const frames = []
  let l = 0
  let r = n - 1
  let mismatches = 0
  frames.push({ phase: 'start', activeLine: L('let l = 0'), pythonLine: P('l = 0'), message: `${n} letters: l starts at the first and r at the last.`, l, r, match: null, mismatches })
  while (l < r) {
    const match = s[l] === s[r]
    if (!match) mismatches++
    frames.push({ phase: 'pair', activeLine: L(match ? 'if (s[l] !== s[r])' : 'if (s[l] !== s[r])'), pythonLine: P('if s[l] != s[r]'), message: match ? `s[${l}] = ${s[l]} matches s[${r}] = ${s[r]}.` : `s[${l}] = ${s[l]} and s[${r}] = ${s[r]} differ: one change is needed. Mismatches: ${mismatches}.`, l, r, match, mismatches })
    l++
    r--
  }
  const result = mismatches <= 2
  frames.push({ phase: 'done', activeLine: L('return mismatches <= 2'), pythonLine: P('return mismatches <= 2'), message: result ? `${mismatches} mismatched pair${mismatches === 1 ? '' : 's'}: one or two changes can make it a palindrome.` : `${mismatches} mismatched pairs need more than two changes.`, l: -1, r: -1, match: null, mismatches })
  return { input: { s }, result, frames }
}
