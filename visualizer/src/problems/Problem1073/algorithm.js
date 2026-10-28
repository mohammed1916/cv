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

export function buildTrace({ arr1, arr2 }) {
  const frames = [{ phase: 'start', activeLine: L('set carry to 0'), written: [], carry: 0, message: 'Add from the least significant digit. Carries are base -2, so they can be negative.' }]
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
    frames.push({ phase: 'digit', activeLine: L('set digit to total'), written: written.slice().reverse(), carry, message: `${a} + ${b} + carry gives ${total}. Write ${digit} and carry ${carry}.` })
    i -= 1
    j -= 1
  }
  while (written.length > 1 && written[written.length - 1] === 0) written.pop()
  const result = written.reverse()
  frames.push({ phase: 'done', activeLine: L('return the answer'), written: result, carry: 0, message: `The sum in base -2 is ${result.join('')}.` })
  return { input: { arr1, arr2 }, result, frames }
}

export const code = `add two negabinary numbers stored most significant digit first
set carry to 0 and walk both arrays from their last digits
while a digit remains in either array or the carry is not 0 do
  set total to the two digits plus carry
  set digit to total modulo 2, which is 0 or 1
  set carry to minus half of total minus digit
  add digit to the front of the answer
remove leading zeros from the answer, keeping one digit
return the answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def add_negabinary(arr1, arr2):
    carry = 0
    i = len(arr1) - 1
    j = len(arr2) - 1
    answer = []
    while i >= 0 or j >= 0 or carry != 0:
        a = arr1[i] if i >= 0 else 0
        b = arr2[j] if j >= 0 else 0
        total = a + b + carry
        digit = total % 2
        carry = -((total - digit) // 2)
        answer.append(digit)
        i -= 1
        j -= 1
    while len(answer) > 1 and answer[-1] == 0:
        answer.pop()
    return answer[::-1]
`
