const L = s => code.findIndex(c => c.text.includes(s)) + 1
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
      frames.push({ pythonLine: PY('parts.append'), phase: 'scan', activeLine: L('nonzero digit'), place, digit, part: digit * place, parts: [...parts],
        message: `The digit ${digit} in place ${place} gives the component ${digit * place}.` })
    } else {
      frames.push({ pythonLine: PY('if digit'), phase: 'scan', activeLine: L('skip'), place, digit, part: null, parts: [...parts],
        message: `The digit in place ${place} is 0, so it contributes nothing.` })
    }
    rest = Math.floor(rest / 10)
    place *= 10
  }
  const result = parts.slice().reverse()
  frames.push({ pythonLine: PY('return parts'), phase: 'done', activeLine: L('return'), place: null, digit: null, part: null, parts: result,
    message: `Components in descending order: ${result.join(', ')}.` })
  return { input: { n }, result, frames }
}

export const code = [
  'decimal components of n',
  '  parts = empty list',
  '  for each decimal place from the ones upward',
  '    skip a zero digit',
  '    a nonzero digit d in place p is the component d times p',
  '  return the parts with the largest first',
].map((text, index) => ({ line: index + 1, text }))

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
