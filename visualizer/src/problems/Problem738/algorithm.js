export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 0 || n > 1000000000) throw new Error('Enter an integer from 0 to 1,000,000,000.')
  return n
}

const JS_LINES = [
  'function monotoneIncreasingDigits(n) {',
  '  const digits = String(n).split(\'\').map(Number)',
  '  let i = 1',
  '  while (i < digits.length && digits[i - 1] <= digits[i]) i++ // find the first descent',
  '  if (i < digits.length) {',
  '    while (i > 0 && digits[i - 1] > digits[i]) { // lower the left digit and keep going left',
  '      digits[i - 1]--',
  '      i--',
  '    }',
  '    for (let j = i + 1; j < digits.length; j++) digits[j] = 9 // everything after it becomes 9',
  '  }',
  '  return Number(digits.join(\'\')) // return the largest monotone value',
  '}',
]
const PY_LINES = [
  'def monotone_increasing_digits(n):',
  '    digits = [int(c) for c in str(n)]',
  '    i = 1',
  '    while i < len(digits) and digits[i - 1] <= digits[i]:',
  '        i += 1',
  '    if i < len(digits):',
  '        while i > 0 and digits[i - 1] > digits[i]:',
  '            digits[i - 1] -= 1',
  '            i -= 1',
  '        for j in range(i + 1, len(digits)):',
  '            digits[j] = 9',
  '    return int(\'\'.join(map(str, digits)))',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Find the first position where a digit is larger than its right neighbour. Lower that digit by one, step left while
// the same problem repeats, then turn everything to its right into 9.
export function buildTrace(n) {
  const digits = String(n).split('').map(Number)
  const frames = [{ phase: 'start', index: -1, digits: [...digits], activeLine: L('const digits'), pythonLine: P('digits = [int'), message: `Digits of ${n}: scan left to right for a descent.` }]
  let i = 1
  while (i < digits.length && digits[i - 1] <= digits[i]) {
    frames.push({ phase: 'scan', index: i, digits: [...digits], activeLine: L('find the first descent'), pythonLine: P('while i < len(digits)'), message: `${digits[i - 1]} ≤ ${digits[i]}: the digits still rise, so keep scanning.` })
    i++
  }
  if (i >= digits.length) {
    frames.push({ phase: 'done', index: digits.length - 1, digits: [...digits], result: n, activeLine: L('return Number'), pythonLine: P('return int'), message: `${n} already has monotone increasing digits.` })
    return { input: n, result: n, frames }
  }
  frames.push({ phase: 'descent', index: i, digits: [...digits], activeLine: L('find the first descent'), pythonLine: P('while i < len(digits)'), message: `${digits[i - 1]} > ${digits[i]} at position ${i}: this descent must be fixed.` })
  while (i > 0 && digits[i - 1] > digits[i]) {
    digits[i - 1]--
    frames.push({ phase: 'lower', index: i - 1, digits: [...digits], activeLine: L('digits[i - 1]--'), pythonLine: P('digits[i - 1] -= 1'), message: `Lower position ${i - 1} by one to ${digits[i - 1]}.` })
    i--
  }
  for (let j = i + 1; j < digits.length; j++) {
    digits[j] = 9
    frames.push({ phase: 'nine', index: j, digits: [...digits], activeLine: L('digits[j] = 9'), pythonLine: P('digits[j] = 9'), message: `Position ${j} becomes 9.` })
  }
  const result = Number(digits.join(''))
  frames.push({ phase: 'done', index: digits.length - 1, digits: [...digits], result, activeLine: L('return Number'), pythonLine: P('return int'), message: `Largest monotone value up to ${n}: ${result}.` })
  return { input: n, result, frames }
}
