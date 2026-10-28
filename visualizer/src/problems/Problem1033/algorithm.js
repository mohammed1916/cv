export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with three stone positions a, b and c.')
  const { a, b, c } = data
  const values = [a, b, c]
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Positions are integers from 1 to 30.')
  if (new Set(values).size !== 3) throw new Error('The three positions must be distinct.')
  return { a, b, c }
}

export function buildTrace(input) {
  const [x, y, z] = [input.a, input.b, input.c].sort((p, q) => p - q)
  const minimum = z - x === 2 ? 0 : (y - x <= 2 || z - y <= 2 ? 1 : 2)
  const maximum = z - x - 2
  const frames = [
    { phase: 'start', activeLine: L('sort the three positions'), stones: [x, y, z], minimum: null, maximum: null, message: `Stones sorted: ${x}, ${y}, ${z}.` },
    { phase: 'minimum', activeLine: L('the minimum is'), stones: [x, y, z], minimum, maximum: null, message: `Minimum moves: ${minimum}.` },
    { phase: 'maximum', activeLine: L('the maximum is'), stones: [x, y, z], minimum, maximum, message: `Maximum moves: ${maximum}. Each move can shrink the span by exactly one.` },
    { phase: 'done', activeLine: L('return the minimum'), stones: [x, y, z], minimum, maximum, message: `Answer: [${minimum}, ${maximum}].` },
  ]
  return { input, result: [minimum, maximum], frames }
}

export const code = `minimum and maximum moves until the stones are consecutive:
  sort the three positions so that x is smallest, y is middle and z is largest
  if z minus x is 2 then the minimum is zero
  otherwise if y minus x is at most 2 or z minus y is at most 2 then the minimum is one
  otherwise the minimum is two
  the maximum is z minus x minus two
  return the minimum and the maximum`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def moving_stones_until_consecutive(a, b, c):
    x, y, z = sorted([a, b, c])
    if z - x == 2:
        lowest = 0
    elif y - x <= 2 or z - y <= 2:
        lowest = 1
    else:
        lowest = 2
    highest = z - x - 2
    return [lowest, highest]
`
