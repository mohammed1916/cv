export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with three stone positions a, b and c.')
  const { a, b, c } = data
  const values = [a, b, c]
  if (values.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Positions are integers from 1 to 30.')
  if (new Set(values).size !== 3) throw new Error('The three positions must be distinct.')
  return { a, b, c }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function movingStonesUntilConsecutive(a, b, c) {', 'def moving_stones_until_consecutive(a, b, c):'],
  ['  const [x, y, z] = [a, b, c].sort((p, q) => p - q)', '    x, y, z = sorted([a, b, c])'],
  ['  let minimum = 2', '    lowest = 2'],
  ['  if (z - x === 2) minimum = 0', '    if z - x == 2: lowest = 0'],
  ['  else if (y - x <= 2 || z - y <= 2) minimum = 1', '    elif y - x <= 2 or z - y <= 2: lowest = 1'],
  ['  const maximum = z - x - 2', '    highest = z - x - 2'],
  ['  return [minimum, maximum]', '    return [lowest, highest]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const [x, y, z] = [input.a, input.b, input.c].sort((p, q) => p - q)
  const minimum = z - x === 2 ? 0 : (y - x <= 2 || z - y <= 2 ? 1 : 2)
  const maximum = z - x - 2
  const frames = [
    { phase: 'start', pythonLine: P('x, y, z = sorted'), activeLine: L('const [x, y, z]'), stones: [x, y, z], minimum: null, maximum: null, message: `Stones sorted: ${x}, ${y}, ${z}.` },
    { phase: 'minimum', pythonLine: P(minimum === 0 ? 'lowest = 0' : minimum === 1 ? 'lowest = 1' : 'lowest = 2'), activeLine: L(minimum === 0 ? 'minimum = 0' : minimum === 1 ? 'minimum = 1' : 'let minimum = 2'), stones: [x, y, z], minimum, maximum: null, message: `Minimum moves: ${minimum}.` },
    { phase: 'maximum', pythonLine: P('highest = z'), activeLine: L('const maximum'), stones: [x, y, z], minimum, maximum, message: `Maximum moves: ${maximum}. Each move can shrink the span by exactly one.` },
    { phase: 'done', pythonLine: P('return [lowest'), activeLine: L('return [minimum'), stones: [x, y, z], minimum, maximum, message: `Answer: [${minimum}, ${maximum}].` },
  ]
  return { input, result: [minimum, maximum], frames }
}
