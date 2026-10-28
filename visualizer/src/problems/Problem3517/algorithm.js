export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input.s !== 'string') throw new Error('Use an object such as {"s": "babab"}.')
  const { s } = input
  if (s.length < 1 || s.length > 60) throw new Error('s needs 1 to 60 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters only.')
  if (s !== [...s].reverse().join('')) throw new Error('s must be a palindrome.')
  return { s }
}

export function buildTrace({ s }) {
  const input = { s }
  const counts = Array(26).fill(0)
  for (const ch of s) counts[ch.charCodeAt(0) - 97] += 1
  const frames = [{ phase: 'count', activeLine: L('count how many times'), letter: null, left: '', middle: '', message: 'Count the letters. A palindrome has at most one letter with an odd count.' }]
  let left = ''
  let middle = ''
  for (let c = 0; c < 26; c++) {
    if (counts[c] === 0) continue
    const letter = String.fromCharCode(97 + c)
    const half = Math.floor(counts[c] / 2)
    if (half > 0) {
      left += letter.repeat(half)
      frames.push({ phase: 'place', activeLine: L('add half of its count'), letter, left, middle, message: `Add ${half} ${letter} to the left half.` })
    }
    if (counts[c] % 2 === 1) {
      middle = letter
      frames.push({ phase: 'middle', activeLine: L('the odd letter goes in the middle'), letter, left, middle, message: `${letter} has an odd count, so it goes in the middle.` })
    }
  }
  const result = left + middle + [...left].reverse().join('')
  frames.push({ phase: 'done', activeLine: L('return left, then middle'), letter: null, left, middle, message: `Smallest palindrome: ${result}.` })
  return { input, result, frames }
}

export const code = `smallest palindromic rearrangement of s
  count how many times each letter appears
  set left to an empty string and middle to an empty string
  for each letter from a to z
    add half of its count, rounded down, to left
    if its count is odd then the odd letter goes in the middle
  return left, then middle, then left reversed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_palindromic_rearrangement(s):
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - 97] += 1
    left = ''
    middle = ''
    for c in range(26):
        if counts[c] == 0:
            continue
        letter = chr(97 + c)
        left += letter * (counts[c] // 2)
        if counts[c] % 2 == 1:
            middle = letter
    return left + middle + left[::-1]
`
