const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export function parseInput(text) {
  const n = JSON.parse(text)
  if (!Number.isInteger(n) || n < 1 || n > 1000000000) throw new Error('Use one integer from 1 to 1000000000.')
  return { n }
}

export function buildTrace({ n }) {
  const frames = []
  const parts = []
  let rest = n
  let place = 1
  while (rest > 0) {
    const digit = rest % 10
    if (digit > 0) {
      parts.push(digit * place)
      frames.push({ pythonLine: PY('parts.append'), phase: 'scan', activeLine: L('if (digit !== 0)'), place, digit, part: digit * place, parts: [...parts],
        message: `The digit ${digit} in place ${place} gives the component ${digit * place}.` })
    } else {
      frames.push({ pythonLine: PY('if digit'), phase: 'scan', activeLine: L('if (digit !== 0)'), place, digit, part: null, parts: [...parts],
        message: `The digit in place ${place} is 0, so it contributes nothing.` })
    }
    rest = Math.floor(rest / 10)
    place *= 10
  }
  const result = parts.slice().reverse()
  frames.push({ pythonLine: PY('return parts'), phase: 'done', activeLine: L('return parts.reverse()'), place: null, digit: null, part: null, parts: result,
    message: `Components in descending order: ${result.join(', ')}.` })
  return { input: { n }, result, frames }
}

export const code = `function decimalComponents(n) {
  const parts = []
  let place = 1
  while (n > 0) {
    const digit = n % 10
    if (digit !== 0) parts.push(digit * place)
    n = Math.floor(n / 10)
    place *= 10
  }
  return parts.reverse()
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}

export const python = `def decimal_components(n):
    parts = []
    place = 1
    while n:
        digit = n % 10
        if digit: parts.append(digit * place)
        n //= 10
        place *= 10
    return parts[::-1]
`
