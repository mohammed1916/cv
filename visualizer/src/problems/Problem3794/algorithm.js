export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || !Number.isInteger(input.k)) throw new Error('Use a JSON object with a string s and an integer k.')
  if (input.s.length < 1 || input.s.length > 30 || !/^[a-z]+$/.test(input.s)) throw new Error('s must be 1 to 30 lowercase letters.')
  if (input.k < 1 || input.k > input.s.length) throw new Error('k must be an integer from 1 to the length of s.')
  return input
}

export function buildTrace(input) {
  const { s, k } = input
  const chars = [...s]
  const frames = [{ phase: 'start', activeLine: L('chars = the characters of s'), left: -1, right: -1, chars: [...chars], message: `Reverse the first ${k} characters of "${s}".` }]
  let left = 0
  let right = k - 1
  while (left < right) {
    ;[chars[left], chars[right]] = [chars[right], chars[left]]
    frames.push({ phase: 'swap', activeLine: L('swap chars[left] and chars[right]'), left, right, chars: [...chars], message: `Swap positions ${left} and ${right}.` })
    left++
    right--
  }
  const result = chars.join('')
  frames.push({ phase: 'done', activeLine: L('return the characters joined'), left: -1, right: -1, chars: [...chars], message: `Result: "${result}".` })
  return { input, result, frames }
}

export const code = `reverse string prefix (s, k):
  chars = the characters of s
  left = 0, right = k - 1
  while left is less than right
    swap chars[left] and chars[right]
    move left forward and right backward
  return the characters joined as a string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reverse_string_prefix(s, k):
    return s[:k][::-1] + s[k:]
`
