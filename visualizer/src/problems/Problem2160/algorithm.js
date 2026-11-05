// LeetCode 2160: Minimum Sum of Four Digit Number After Splitting Digits.
// Sort the four digits. Alternate them between the two numbers, so the two tens digits are the smallest two
// and the two units digits are next: new1 = d0 d2 and new2 = d1 d3 in sorted order.

export function parseInput(text) {
  const trimmed = text.trim()
  if (!/^[1-9][0-9]{3}$/.test(trimmed)) throw new Error('Use a four-digit number from 1000 to 9999.')
  return { num: Number(trimmed) }
}

export const code = `function minimumSum(num) {
  const digits = String(num).split('').map(Number).sort((a, b) => a - b)
  const new1 = digits[0] * 10 + digits[2]
  const new2 = digits[1] * 10 + digits[3]
  return new1 + new2
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: minimum_sum
def minimum_sum(num):
    digits = sorted(int(ch) for ch in str(num))
    new1 = digits[0] * 10 + digits[2]
    new2 = digits[1] * 10 + digits[3]
    return new1 + new2
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'sort', label: 'Sort digits', description: 'Order the four digits from smallest to largest.' },
  { id: 'assign', label: 'Deal digits', description: 'Deal the sorted digits alternately into the two numbers.' },
  { id: 'done', label: 'Result', description: 'The sum of the two numbers.' },
]

export function buildTrace({ num }) {
  const frames = []
  const original = String(num).split('').map(Number)
  const digits = [...original].sort((a, b) => a - b)
  frames.push({ phase: 'sort', activeLine: L('const digits'), pythonLine: P('digits = sorted'), message: `Digits of ${num} sorted: ${digits.join(', ')}.`, digits, new1: [], new2: [], total: null })
  const new1 = digits[0] * 10 + digits[2]
  frames.push({ phase: 'assign', activeLine: L('const new1'), pythonLine: P('new1 ='), message: `First number takes the 1st and 3rd sorted digits: ${digits[0]}${digits[2]} = ${new1}.`, digits, new1: [digits[0], digits[2]], new2: [], total: null })
  const new2 = digits[1] * 10 + digits[3]
  frames.push({ phase: 'assign', activeLine: L('const new2'), pythonLine: P('new2 ='), message: `Second number takes the 2nd and 4th: ${digits[1]}${digits[3]} = ${new2}.`, digits, new1: [digits[0], digits[2]], new2: [digits[1], digits[3]], total: null })
  const total = new1 + new2
  frames.push({ phase: 'done', activeLine: L('return new1 + new2'), pythonLine: P('return new1 + new2'), message: `Minimum sum: ${new1} + ${new2} = ${total}.`, digits, new1: [digits[0], digits[2]], new2: [digits[1], digits[3]], total })
  return { input: { num }, result: total, frames }
}
