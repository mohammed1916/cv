export const phases = [
  { id: 'start', label: 'Start', description: 'Write the number as a row of digits so each position can be inspected.' },
  { id: 'scan', label: 'Scan left to right', description: 'The leftmost digit has the largest place value, so the first 6 found is the best one to change.' },
  { id: 'change', label: 'Change first 6', description: 'Turn that 6 into a 9 and stop. Changing anything further right gives a smaller result.' },
  { id: 'done', label: 'Complete', description: 'Return the digits as a number. If no 6 exists, the number is unchanged.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"num": 9669}.')
  const { num } = input
  if (!Number.isInteger(num) || num < 1 || num > 999999) throw new Error('num is an integer from 1 to 999999.')
  if (!/^[69]+$/.test(String(num))) throw new Error('num may contain only the digits 6 and 9.')
  return { num }
}

export function buildTrace({ num }) {
  const digits = String(num).split('')
  let changedAt = null
  const snap = (index) => ({ digits: [...digits], index, changedAt })
  const frames = [{ phase: 'start', activeLine: L('digits = the digits'), pythonLine: P('digits = list'), snapshot: snap(null), message: `Digits of ${num}, read from the left.` }]
  for (let i = 0; i < digits.length; i++) {
    if (digits[i] === '6') {
      changedAt = i
      frames.push({ phase: 'scan', activeLine: L('if digits[i] is 6'), pythonLine: P("if d == '6'"), snapshot: snap(i), message: `Position ${i} holds 6, the first one from the left.` })
      digits[i] = '9'
      frames.push({ phase: 'change', activeLine: L('replace it with 9'), pythonLine: P("digits[i] = '9'"), snapshot: snap(i), message: `Replace that 6 with 9. Later digits stay as they are.` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('for each position'), pythonLine: P('for i, d'), snapshot: snap(i), message: `Position ${i} holds ${digits[i]}, which is not a 6. Keep scanning.` })
  }
  const result = Number(digits.join(''))
  frames.push({ phase: 'done', activeLine: L('return the digits'), pythonLine: P('return int'), snapshot: snap(null), message: changedAt === null ? `No 6 appears, so the number stays ${result}.` : `The largest result is ${result}.` })
  return { input: { num }, result, frames }
}

export const code = `maximum 69 number (num):
  digits = the digits of num, left to right
  for each position i:
    if digits[i] is 6:
      replace it with 9
      stop scanning
  return the digits as a number`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def maximum69_number(num):
    digits = list(str(num))
    for i, d in enumerate(digits):
        if d == '6':
            digits[i] = '9'
            break
    return int(''.join(digits))
`
