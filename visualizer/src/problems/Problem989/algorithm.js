// Add from the right. At each position, sum the digit of num, the lowest digit of k and the carry from the position
// before. Keep the last digit of the sum and pass the rest on as the carry. Digits are built in reverse, then flipped.
export const code = String.raw`function addToArrayForm(num, k) {
  const digits = []; // least significant digit first
  let i = num.length - 1; // cursor into num, moving left
  let carry = 0;
  while (i >= 0 || k > 0 || carry > 0) {
    const total = carry + (i >= 0 ? num[i] : 0) + (k % 10);
    digits.push(total % 10); // keep the last digit of this position
    carry = Math.floor(total / 10); // the rest moves one place left
    k = Math.floor(k / 10);
    i--;
  }
  return digits.reverse();
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def add_to_array_form(num, k):
    digits = []  # least significant digit first
    i = len(num) - 1  # cursor into num, moving left
    carry = 0
    while i >= 0 or k > 0 or carry > 0:
        total = carry + (num[i] if i >= 0 else 0) + k % 10
        digits.append(total % 10)  # keep the last digit of this position
        carry = total // 10  # the rest moves one place left
        k //= 10
        i -= 1
    return digits[::-1]`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'add', label: 'Add digits', description: 'Add one position at a time, from the right, with the carry.' },
  { id: 'done', label: 'Result', description: 'The digits, read from the left.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const num = input && input.num
  const k = input && input.k
  if (!Array.isArray(num) || num.length < 1 || num.length > 12) throw new Error('Use num: a list of 1 to 12 digits.')
  if (num.some(d => !Number.isInteger(d) || d < 0 || d > 9)) throw new Error('Each entry of num must be a digit from 0 to 9.')
  if (num.length > 1 && num[0] === 0) throw new Error('num must not have leading zeros.')
  if (!Number.isInteger(k) || k < 0 || k > 99999) throw new Error('k must be an integer from 0 to 99999.')
  return { num, k }
}

export function buildTrace({ num, k }) {
  const digits = []
  let i = num.length - 1
  let carry = 0
  let remaining = k
  const frames = []
  while (i >= 0 || remaining > 0 || carry > 0) {
    const fromNum = i >= 0 ? num[i] : 0
    const fromK = remaining % 10
    const total = carry + fromNum + fromK
    digits.push(total % 10)
    const nextCarry = Math.floor(total / 10)
    frames.push({ phase: 'add', activeLine: L('const total = carry'), pythonLine: PY('total = carry'), cursor: i, fromNum, fromK, carryIn: carry, total, carryOut: nextCarry,
      digits: [...digits].reverse(), message: `Position ${digits.length} from the right: ${fromNum} + ${fromK} + carry ${carry} = ${total}. Write ${total % 10}${nextCarry ? `, carry ${nextCarry}` : ''}.` })
    carry = nextCarry
    remaining = Math.floor(remaining / 10)
    i--
  }
  const result = digits.reverse()
  frames.push({ phase: 'done', activeLine: L('return digits.reverse()'), pythonLine: PY('return digits[::-1]'), cursor: -1, fromNum: null, fromK: null, carryIn: 0, total: null, carryOut: 0, digits: result, message: `The sum is ${result.join('')}.` })
  return { input: { num, k }, result, frames }
}
