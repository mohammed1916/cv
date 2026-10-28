export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with s and k.')
  const { s, k } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 24 || !/^[a-z]+$/.test(s)) throw new Error('s is 1 to 24 lowercase letters.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k is an integer from 1 to 6.')
  if (s.length % k !== 0) throw new Error('The length of s must be a multiple of k.')
  return { s, k }
}

export function buildTrace(input) {
  const { s, k } = input
  let result = ''
  const frames = [{ phase: 'start', activeLine: L('set result to an empty string'), start: -1, total: 0, value: 0, result, message: `Split s into blocks of ${k} characters.` }]
  for (let start = 0; start < s.length; start += k) {
    let total = 0
    for (const ch of s.slice(start, start + k)) total += ch.charCodeAt(0) - 97
    const value = total % 26
    result += String.fromCharCode(97 + value)
    frames.push({ phase: 'block', activeLine: L('set value to total modulo 26'), start, total, value, result, message: `Block at ${start} sums to ${total}; ${total} mod 26 is ${value}, which is letter ${String.fromCharCode(97 + value)}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return result'), start: -1, total: 0, value: 0, result, message: `Hashed string: ${result}.` })
  return { input, result, frames }
}

export const code = `hash each block of k characters:
  set result to an empty string
  for each block of k consecutive characters
    set total to the sum of the alphabet positions in the block
    set value to total modulo 26
    append the letter at position value to result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def hash_divided_string(s, k):
    result = []
    for start in range(0, len(s), k):
        total = sum(ord(ch) - ord('a') for ch in s[start:start + k])
        result.append(chr(ord('a') + total % 26))
    return ''.join(result)
`
