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
  frames.push({ pythonLine: P('kept = '), phase: 'start', activeLine: L('for (const digit'), at: -1, kept, message: `Read the digits of ${n}.` })
  for (let i = 0; i < digits.length; i++) {
    frames.push({ pythonLine: P('for digit'), phase: 'scan', activeLine: L('for (const digit'), at: i, kept, message: `Look at digit ${digits[i]}.` })
    if (digits[i] !== '0') {
      kept += digits[i]
      frames.push({ pythonLine: P('kept += digit'), phase: 'keep', activeLine: L('kept += digit'), at: i, kept, ok: true, message: `Keep ${digits[i]}; kept digits are ${kept}.` })
    } else {
      frames.push({ pythonLine: P("if digit != '0'"), phase: 'check', activeLine: L("if (digit !== '0')"), at: i, kept, ok: false, message: 'Zero is dropped.' })
    }
  }
  const result = Number(kept)
  frames.push({ pythonLine: P('return int'), phase: 'done', activeLine: L('return Number(kept)'), at: -1, kept, ok: true, message: `The result is ${result}.` })
  return { input: { n }, result, frames }
}

export const code = `function removeZeros(n) {
  let kept = ''
  for (const digit of String(n)) {
    if (digit !== '0') kept += digit
  }
  return Number(kept)
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

export const python = `def remove_zeros(n):
    kept = ''
    for digit in str(n):
        if digit != '0':
            kept += digit
    return int(kept)
`
