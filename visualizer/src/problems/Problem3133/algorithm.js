export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and x.')
  const { n, x } = data
  if (!Number.isInteger(n) || n < 1 || n > 200) throw new Error('n must be an integer from 1 to 200.')
  if (!Number.isInteger(x) || x < 1 || x > 200) throw new Error('x must be an integer from 1 to 200.')
  return { n, x }
}

export function buildTrace({ n, x }) {
  const frames = []
  let value = x
  let remaining = n - 1
  let position = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('let value = x'), position, value, remaining, message: `Start with value ${x}; ${remaining} more bits must be placed.` })
  while (remaining > 0) {
    if (!((x >> position) & 1)) {
      const bit = remaining & 1
      value |= bit << position
      remaining >>= 1
      frames.push({ pythonLine: 7, phase: 'place', activeLine: L('value |= (remaining'), position, value, remaining, message: `Bit ${position} of x is 0, so it takes bit ${bit} of n - 1.` })
    } else {
      frames.push({ pythonLine: 6, phase: 'skip', activeLine: L('if (((x >> position)'), position, value, remaining, message: `Bit ${position} of x is already 1, so it is kept.` })
    }
    position++
  }
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return value'), position, value, remaining, message: `Minimum last element: ${value}.` })
  return { input: { n, x }, result: value, frames }
}

export const code = `function minArrayEnd(n, x) {
  let value = x
  let remaining = n - 1
  let position = 0
  while (remaining > 0) {
    if (((x >> position) & 1) === 0) {
      value |= (remaining & 1) << position
      remaining >>= 1
    }
    position++
  }
  return value
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error('missing code line: ' + s); return i + 1 }

export const python = `def min_array_end(n, x):
    value = x
    remaining = n - 1
    position = 0
    while remaining > 0:
        if not (x >> position) & 1:
            value |= (remaining & 1) << position
            remaining >>= 1
        position += 1
    return value
`
