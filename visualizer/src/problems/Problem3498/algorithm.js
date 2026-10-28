export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with exactly one key, s.')
  const { s } = input
  if (typeof s !== 'string' || s.length < 1 || s.length > 50) throw new Error('s must be a string of 1 to 50 letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  return { s }
}

export function buildTrace({ s }) {
  const frames = [{ phase: 'start', activeLine: L('set total to'), position: -1, rank: 0, total: 0, message: 'Start with a total of zero.' }]
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const rank = 26 - (s.charCodeAt(i) - 97)
    total += rank * (i + 1)
    frames.push({ phase: 'add', activeLine: L('add rank times'), position: i, rank, total, message: `Position ${i + 1} holds ${s[i]}, which ranks ${rank} counted from the end. Add ${rank} times ${i + 1}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), position: -1, rank: 0, total, message: `Reverse degree: ${total}.` })
  return { input: { s }, result: total, frames }
}

export const code = `reverse degree of a string:
  set total to zero
  for each position i, counting from 1 to the length
    let letter be the letter at position i
    let rank be its place counted from the end of the alphabet, where z is 1 and a is 26
    add rank times i to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reverse_degree(s):
    total = 0
    for i, ch in enumerate(s, start=1):
        rank = 26 - (ord(ch) - ord('a'))
        total += rank * i
    return total
`
