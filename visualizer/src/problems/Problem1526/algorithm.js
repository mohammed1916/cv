export const phases = [
  { id: 'start', label: 'Flat start', description: 'The line starts at height 0, so nothing has been raised yet.' },
  { id: 'raise', label: 'Raise a layer', description: 'This height is above the previous one, so that many new increments must start here.' },
  { id: 'level', label: 'Level or fall', description: 'This height is not above the previous one, so earlier increments already cover it.' },
  { id: 'done', label: 'Total', description: 'The sum of all rises is the minimum number of operations.' },
]

export function parseInput(text) {
  const heights = JSON.parse(text)
  if (!Array.isArray(heights) || heights.length < 1 || heights.length > 12 || !heights.every(v => Number.isInteger(v) && v >= 0 && v <= 50)) {
    throw new Error('Enter a JSON array of 1 to 12 integers from 0 to 50.')
  }
  return heights
}

export const code = [
  "function minIncrements(target) {",
  "  let total = 0",
  "  let previous = 0",
  "  for (const height of target) {",
  "    const rise = height - previous",
  "    if (rise > 0) {",
  "      total += rise }",
  "    previous = height }",
  "  return total }",
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_increments(target):
    total = 0
    previous = 0
    for height in target:
        rise = height - previous
        if rise > 0:
            total += rise
        previous = height
    return total
`

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })

export function buildTrace(heights) {
  const frames = []
  let total = 0
  let previous = 0
  const snap = (index, rise) => ({ heights, index, previous, rise, total })
  frames.push({ phase: 'start', ...at('total = 0', 'total = 0'), message: `The line starts flat at 0. Scan the ${heights.length} heights from left to right; every rise above the previous height needs new increments.`, snapshot: snap(null, null) })
  heights.forEach((height, index) => {
    const rise = height - previous
    if (rise > 0) {
      total += rise
      frames.push({ phase: 'raise', ...at('total += rise', 'total += rise'), message: `Height ${height} is ${rise} above ${previous}, so ${rise} new increment${rise === 1 ? '' : 's'} begin at index ${index}. Total is ${total}.`, snapshot: snap(index, rise) })
    } else {
      frames.push({ phase: 'level', ...at('if (rise > 0)', 'if rise > 0'), message: `Height ${height} is not above ${previous}. Increments already placed can cover it, so nothing new is added.`, snapshot: snap(index, rise) })
    }
    previous = height
  })
  frames.push({ phase: 'done', ...at('return total', 'return total'), message: `Return ${total}, the sum of all rises.`, snapshot: snap(null, null) })
  return { input: heights, result: total, frames }
}
