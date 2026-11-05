const MAX_DIGITS = 30

function checkDigits(arr, name) {
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_DIGITS) throw new Error(`${name} must be an array of 1 to ${MAX_DIGITS} digits.`)
  if (arr.some(d => d !== 0 && d !== 1)) throw new Error(`${name} may only contain 0 and 1.`)
  if (arr.length > 1 && arr[0] === 0) throw new Error(`${name} must not have leading zeros.`)
  return arr
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with arr1 and arr2.')
  return { arr1: checkDigits(input.arr1, 'arr1'), arr2: checkDigits(input.arr2, 'arr2') }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function addNegabinary(arr1, arr2) {', 'def add_negabinary(arr1, arr2):'],
  ['  let carry = 0', '    carry = 0'],
  ['  let i = arr1.length - 1', '    i = len(arr1) - 1'],
  ['  let j = arr2.length - 1', '    j = len(arr2) - 1'],
  ['  const written = []', '    answer = []'],
  ['  while (i >= 0 || j >= 0 || carry !== 0) {', '    while i >= 0 or j >= 0 or carry != 0:'],
  ['    const a = i >= 0 ? arr1[i] : 0', '        a = arr1[i] if i >= 0 else 0'],
  ['    const b = j >= 0 ? arr2[j] : 0', '        b = arr2[j] if j >= 0 else 0'],
  ['    const total = a + b + carry', '        total = a + b + carry'],
  ['    const digit = ((total % 2) + 2) % 2', '        digit = total % 2'],
  ['    carry = -((total - digit) / 2)', '        carry = -((total - digit) // 2)'],
  ['    written.push(digit)', '        answer.append(digit)'],
  ['    i -= 1', '        i -= 1'],
  ['    j -= 1', '        j -= 1'],
  ['  }', ''],
  ['  while (written.length > 1 && written[written.length - 1] === 0) written.pop()', '    while len(answer) > 1 and answer[-1] == 0: answer.pop()'],
  ['  return written.reverse()', '    return answer[::-1]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ arr1, arr2 }) {
  const frames = [{ phase: 'start', pythonLine: P('carry = 0'), activeLine: L('let carry = 0'), written: [], carry: 0, cols: { i: arr1.length - 1, j: arr2.length - 1 }, message: 'Add from the least significant digit. Carries are base -2, so they can be negative.' }]
  let carry = 0
  let i = arr1.length - 1
  let j = arr2.length - 1
  const written = []
  while (i >= 0 || j >= 0 || carry !== 0) {
    const a = i >= 0 ? arr1[i] : 0
    const b = j >= 0 ? arr2[j] : 0
    const total = a + b + carry
    const digit = ((total % 2) + 2) % 2
    carry = -((total - digit) / 2)
    written.push(digit)
    frames.push({ phase: 'digit', pythonLine: P('answer.append(digit)'), activeLine: L('const digit ='), written: written.slice().reverse(), carry, cols: { i: i >= 0 ? i : -1, j: j >= 0 ? j : -1 }, message: `${a} + ${b} + carry gives ${total}. Write ${digit} and carry ${carry}.` })
    i -= 1
    j -= 1
  }
  while (written.length > 1 && written[written.length - 1] === 0) written.pop()
  const result = written.reverse()
  frames.push({ phase: 'done', pythonLine: P('answer[::-1]'), activeLine: L('return written.reverse()'), written: result, carry: 0, message: `The sum in base -2 is ${result.join('')}.` })
  return { input: { arr1, arr2 }, result, frames }
}
