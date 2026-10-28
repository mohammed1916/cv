export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || typeof obj.s !== 'string') throw new Error('Use an object with a string key s.')
  const { s } = obj
  if (s.length < 1 || s.length > 20 || !/^[01]+$/.test(s) || !s.includes('1')) throw new Error('s is 1 to 20 binary digits with at least one 1.')
  return { s }
}

export function buildTrace(input) {
  const { s } = input
  const ones = [...s].filter(ch => ch === '1').length
  const zeros = s.length - ones
  const frames = [{ phase: 'count', activeLine: L('set ones to the count'), ones, zeros, result: '', message: `The string has ${ones} one(s) and ${zeros} zero(s).` }]
  const result = '1'.repeat(ones - 1) + '0'.repeat(zeros) + '1'
  frames.push({ phase: 'place', activeLine: L('set result to'), ones, zeros, result, message: 'The last digit must be 1 for the number to be odd; the other ones go first to be as large as possible.' })
  frames.push({ phase: 'done', activeLine: L('return result'), ones, zeros, result, message: `Maximum odd binary number: ${result}.` })
  return { input, s, result, frames }
}

export const code = `maximum odd binary number
  set ones to the count of 1 in s
  set zeros to the count of 0 in s
  set result to ones minus 1 copies of 1
  add zeros copies of 0 to result
  add one 1 to the end of result
  return result`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_odd_binary(s):
    ones = s.count('1')
    zeros = len(s) - ones
    return '1' * (ones - 1) + '0' * zeros + '1'
`
