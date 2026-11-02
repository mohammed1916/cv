// LeetCode 1842 (draft): Next Palindrome Using Same Digits.
// Input: a palindromic digit string s (visualization cap: 10 digits). Return the smallest larger palindrome made by
// rearranging exactly the digits of s, or "" when none exists. Length and digit multiplicities are kept.
// A palindrome is fixed by its first half (plus the middle digit when the length is odd), so the next palindrome comes
// from the next permutation of the first half.

const CODE_TEXT = `FUNCTION nextPalindrome(s)
    n ← length of s, half ← first floor(n / 2) digits of s
    middle ← the middle digit when n is odd, otherwise empty
    i ← last index of half minus 1
    WHILE i is at least 0 AND half[i] is at least half[i + 1]
        i ← i minus 1
    IF i is less than 0, RETURN empty string
    j ← last index of half
    WHILE half[j] is at most half[i]
        j ← j minus 1
    swap half[i] and half[j]
    reverse the part of half after index i
    RETURN half + middle + reverse of half`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def next_palindrome(s):
    n = len(s)
    half = list(s[: n // 2])
    middle = s[n // 2] if n % 2 else ""
    i = len(half) - 2
    while i >= 0 and half[i] >= half[i + 1]:
        i -= 1
    if i < 0:
        return ""
    j = len(half) - 1
    while half[j] <= half[i]:
        j -= 1
    half[i], half[j] = half[j], half[i]
    half[i + 1:] = half[i + 1:][::-1]
    first = "".join(half)
    return first + middle + first[::-1]
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'half', label: 'Half', description: 'The first half fixes the whole palindrome.' },
  { id: 'pivot', label: 'Pivot', description: 'Find the rightmost digit that can grow.' },
  { id: 'swap', label: 'Swap', description: 'Swap it with the smallest larger digit to its right.' },
  { id: 'reverse', label: 'Reverse', description: 'Sort the tail into the smallest order.' },
  { id: 'done', label: 'Result', description: 'Mirror the half to build the palindrome.' },
]

export function parseInput(text) {
  const s = text.trim().replace(/^"(.*)"$/, '$1')
  if (!/^[0-9]+$/.test(s) || s.length < 1 || s.length > 10) throw new Error('Use 1 to 10 digits forming a palindrome.')
  if (s !== [...s].reverse().join('')) throw new Error('The input must already be a palindrome.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const half = s.slice(0, Math.floor(n / 2)).split('')
  const middle = n % 2 ? s[Math.floor(n / 2)] : ''
  const frames = []
  const snap = () => half.slice()
  frames.push({ pythonLine: P('half = list(s'), phase: 'half', activeLine: L('n ← length of s'), half: snap(), middle, i: null, j: null, message: `First half ${half.join('') || '(empty)'}${middle ? `, middle ${middle}` : ''}.` })
  let i = half.length - 2
  while (i >= 0 && half[i] >= half[i + 1]) i -= 1
  if (i < 0) {
    frames.push({ pythonLine: P('return ""'), phase: 'done', activeLine: L('RETURN empty string'), half: snap(), middle, i: null, j: null, message: 'The half is in its largest order: no larger palindrome exists.' })
    return { input: s, result: '', frames }
  }
  frames.push({ pythonLine: P('while i >= 0 and half[i]'), phase: 'pivot', activeLine: L('i ← i minus 1'), half: snap(), middle, i, j: null, message: `Digit ${half[i]} at ${i} is smaller than the digit after it: pivot found.` })
  let j = half.length - 1
  while (half[j] <= half[i]) j -= 1
  ;[half[i], half[j]] = [half[j], half[i]]
  frames.push({ pythonLine: P('half[i], half[j] = half[j], half[i]'), phase: 'swap', activeLine: L('swap half[i] and half[j]'), half: snap(), middle, i, j, message: `Swap ${half[j]} (now at ${i}) with ${half[i]} (now at ${j}).` })
  const tail = half.slice(i + 1).reverse()
  for (let k = 0; k < tail.length; k++) half[i + 1 + k] = tail[k]
  frames.push({ pythonLine: P('half[i + 1:] = half[i + 1:][::-1]'), phase: 'reverse', activeLine: L('reverse the part of half after index i'), half: snap(), middle, i, j, message: `Sort the digits after index ${i} into ascending order.` })
  const first = half.join('')
  const result = first + middle + first.split('').reverse().join('')
  frames.push({ pythonLine: P('return first + middle + first[::-1]'), phase: 'done', activeLine: L('RETURN half + middle + reverse of half'), half: snap(), middle, i, j, message: `Mirror the half: ${result}.` })
  return { input: s, result, frames }
}
