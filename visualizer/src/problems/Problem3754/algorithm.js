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
  frames.push({ pythonLine: P('x = 0'), phase: 'start', activeLine: L('let x = 0'), at: -1, x, total, message: 'Start with x = 0 and digit sum 0.' })
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i])
    frames.push({ pythonLine: P('for ch in'), phase: 'scan', activeLine: L('for (const ch'), at: i, x, total, message: `Read digit ${d}.` })
    if (d !== 0) {
      x = x * 10 + d
      frames.push({ pythonLine: P('x = x * 10'), phase: 'append', activeLine: L('if (d !== 0)'), at: i, x, total, ok: true, message: `Append ${d}; x is now ${x}.` })
    }
    total += d
    frames.push({ pythonLine: P('total += int'), phase: 'sum', activeLine: L('total += d'), at: i, x, total, ok: true, message: `Digit sum is now ${total}.` })
  }
  const result = x * total
  frames.push({ pythonLine: P('return x * total'), phase: 'done', activeLine: L('return x * total'), at: -1, x, total, ok: true, message: `${x} times ${total} is ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `function concatMultiply(n) {
  const digits = String(n)
  let x = 0
  let total = 0
  for (const ch of digits) {
    const d = Number(ch)
    if (d !== 0) x = x * 10 + d
    total += d
  }
  return x * total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

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
