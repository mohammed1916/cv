export const phases = [
  { id: 'start', label: 'Start', description: 'Read the digits from the left; only the first 6 matters, because a change there gives the largest increase.' },
  { id: 'scan', label: 'Scan digits', description: 'Look at each digit from the left until a 6 is found.' },
  { id: 'change', label: 'Change the 6', description: 'Replace the first 6 with a 9; that digit has the largest place value that can grow.' },
  { id: 'keep', label: 'Keep digits', description: 'If there is no 6, the number is already all 9s and stays as it is.' },
  { id: 'done', label: 'Complete', description: 'Return the number after at most one change.' },
]

export const examples = [
  { label: 'Leading six', input: '{"num":9669}' },
  { label: 'Middle six', input: '{"num":9996}' },
  { label: 'No six', input: '{"num":9999}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with num, such as {"num":9669}.')
  const { num } = data
  if (!Number.isInteger(num) || num < 1 || num > 10000) throw new Error('num must be an integer from 1 to 10000.')
  if (!String(num).split('').every(d => d === '6' || d === '9')) throw new Error('num must use only the digits 6 and 9.')
  return num
}

export function buildTrace({ num }) {
  const digits = String(num).split('')
  let changedAt = -1
  const snap = (index, extra = {}) => ({ digits: [...digits], index, changedAt, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const digits = String'), pythonLine: P('digits = list'), snapshot: snap(-1),
    message: `Read ${num} from the left. Changing the first 6 gives the largest possible value.` }]
  for (let i = 0; i < digits.length; i++) {
    frames.push({ phase: 'scan', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), snapshot: snap(i),
      message: `Digit ${digits[i]} at position ${i}.` })
    if (digits[i] === '6') {
      digits[i] = '9'
      changedAt = i
      frames.push({ phase: 'change', activeLine: L("if (digits[i] === '6')"), pythonLine: P("if digits[i] == '6'"), snapshot: snap(i),
        message: `The first 6 is at position ${i}; change it to 9.` })
      break
    }
  }
  if (changedAt === -1) {
    frames.push({ phase: 'keep', activeLine: L('return Number(digits.join'), pythonLine: P('return int'), snapshot: snap(-1),
      message: 'There is no 6, so the number is unchanged.' })
  }
  const result = Number(digits.join(''))
  frames.push({ phase: 'done', activeLine: L('return Number(digits.join'), pythonLine: P('return int'), snapshot: snap(-1),
    message: `Return ${result}.`, result })
  return { input: { num }, result, frames }
}

export const code = `function maximum69Number(num) {
  const digits = String(num).split('')
  for (let i = 0; i < digits.length; i++) {
    if (digits[i] === '6') {
      digits[i] = '9'
      break
    }
  }
  return Number(digits.join(''))
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum69_number(num):
    digits = list(str(num))
    for i in range(len(digits)):
        if digits[i] == '6':
            digits[i] = '9'
            break
    return int(''.join(digits))
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
