export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 1 || n > 1e12) throw new Error('n is an integer from 1 to 10^12.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n)
  const frames = []
  let kept = ''
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('digits'), at: -1, kept, message: `Read the digits of ${n}.` })
  for (let i = 0; i < digits.length; i++) {
    frames.push({ pythonLine: 3, phase: 'scan', activeLine: L('for each digit'), at: i, kept, message: `Look at digit ${digits[i]}.` })
    if (digits[i] !== '0') {
      kept += digits[i]
      frames.push({ pythonLine: 5, phase: 'keep', activeLine: L('append'), at: i, kept, ok: true, message: `Keep ${digits[i]}; kept digits are ${kept}.` })
    } else {
      frames.push({ pythonLine: 4, phase: 'check', activeLine: L('if the digit'), at: i, kept, ok: false, message: 'Zero is dropped.' })
    }
  }
  const result = Number(kept)
  frames.push({ pythonLine: 6, phase: 'done', activeLine: L('return'), at: -1, kept, ok: true, message: `The result is ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `remove zeros from the decimal digits of n
  kept = empty string
  for each digit of n from left to right
    if the digit is not zero then
      append the digit to kept
  return kept read as an integer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def remove_zeros(n):
    kept = ''
    for digit in str(n):
        if digit != '0':
            kept += digit
    return int(kept)
`
