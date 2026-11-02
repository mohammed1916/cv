export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n.')
  const { n } = input
  if (!Number.isInteger(n) || n < 0 || n > 1e9) throw new Error('n is an integer from 0 to 10^9.')
  return { n }
}

export function buildTrace({ n }) {
  const digits = String(n)
  const frames = []
  let x = 0
  let total = 0
  frames.push({ pythonLine: 3, phase: 'start', activeLine: L('x = 0'), at: -1, x, total, message: 'Start with x = 0 and digit sum 0.' })
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i])
    frames.push({ pythonLine: 5, phase: 'scan', activeLine: L('for each digit'), at: i, x, total, message: `Read digit ${d}.` })
    if (d !== 0) {
      x = x * 10 + d
      frames.push({ pythonLine: 7, phase: 'append', activeLine: L('append'), at: i, x, total, ok: true, message: `Append ${d}; x is now ${x}.` })
    }
    total += d
    frames.push({ pythonLine: 8, phase: 'sum', activeLine: L('add the digit'), at: i, x, total, ok: true, message: `Digit sum is now ${total}.` })
  }
  const result = x * total
  frames.push({ pythonLine: 9, phase: 'done', activeLine: L('return'), at: -1, x, total, ok: true, message: `${x} times ${total} is ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `concatenate non-zero digits of n and multiply by the digit sum
  x = 0
  total = 0
  for each digit d of n from left to right
    if d is not zero then x = x * 10 + d
    total = total + d
  return x * total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def concat_multiply(n):
    digits = str(n)
    x = 0
    total = 0
    for ch in digits:
        if ch != '0':
            x = x * 10 + int(ch)
        total += int(ch)
    return x * total
`
