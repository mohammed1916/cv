export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj.s !== 'string') throw new Error('Use an object with a string field s.')
  const { s } = obj
  if (s.length < 1 || s.length > 16) throw new Error('Use s with 1 to 16 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must use lowercase letters a to z only.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const frames = []
  let bits = ''
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    const chunk = code.toString(2).padStart(8, '0')
    bits += chunk
    frames.push({ phase: 'encode', activeLine: L('append the 8-bit'), index: i, bits, chunk, result: null, message: `${s[i]} has code ${code}, which is ${chunk} in binary.` })
  }
  const result = bits === [...bits].reverse().join('')
  frames.push({ phase: 'done', activeLine: L('return whether'), index: -1, bits, chunk: null, result, message: `The bit string ${result ? 'is' : 'is not'} a palindrome.` })
  return { input, result, frames }
}

export const code = `check ascii palindromic(s)
  set bits to an empty string
  for each character c in s do
    append the 8-bit binary form of the ASCII code of c to bits
  compare bits with its reverse
  return whether they are equal`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_ascii_palindromic(s):
    bits = ''
    for c in s:
        bits += format(ord(c), '08b')
    return bits == bits[::-1]
`
