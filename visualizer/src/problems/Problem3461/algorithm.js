export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s.')
  const { s } = data
  if (typeof s !== 'string' || s.length < 3 || s.length > 30 || !/^[0-9]+$/.test(s)) throw new Error('s is 3 to 30 digits.')
  return { s }
}

export function buildTrace(input) {
  let row = [...input.s].map(Number)
  let round = 0
  const frames = [{ phase: 'start', activeLine: L('set digits to the digits'), row: [...row], round, message: `Start with ${row.join('')}.` }]
  while (row.length > 2) {
    row = row.slice(0, -1).map((d, i) => (d + row[i + 1]) % 10)
    round += 1
    frames.push({ phase: 'round', activeLine: L('make a new list'), row: [...row], round, message: `Round ${round}: each entry is the sum of two neighbors mod 10, giving ${row.join('')}.` })
  }
  const result = row[0] === row[1]
  frames.push({ phase: 'done', activeLine: L('return whether'), row: [...row], round, message: `The last two digits are ${row[0]} and ${row[1]}, so they ${result ? 'match' : 'do not match'}.` })
  return { input, result, frames }
}

export const code = `check if the digits are equal after the operations
  set digits to the digits of s
  while digits has more than two values
    make a new list where each entry is the sum of two neighbors modulo 10
    set digits to the new list
  return whether the two remaining digits are equal`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def digits_equal_after_ops(s):
    digits = [int(ch) for ch in s]
    while len(digits) > 2:
        digits = [(digits[i] + digits[i + 1]) % 10 for i in range(len(digits) - 1)]
    return digits[0] == digits[1]
`
