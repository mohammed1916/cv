// Largest square: a rectangle yields a square of side min(width, height); count the rectangles with the largest side.
const JS_LINES = [
  { text: 'let maxSide = 0, count = 0', py: 'max_side = 0' },
  { text: 'for (const [w, h] of rectangles) {', py: 'for w, h in rectangles' },
  { text: 'const side = Math.min(w, h)', py: 'side = min(' },
  { text: 'if (side > maxSide) { maxSide = side; count = 1 }', py: 'if side > max_side' },
  { text: 'else if (side === maxSide) count++', py: 'elif side == max_side' },
  { text: '}', py: null },
  { text: 'return count', py: 'return count' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def countGoodRectangles(rectangles):
    max_side = 0
    count = 0
    for w, h in rectangles:
        side = min(w, h)
        if side > max_side:
            max_side = side
            count = 1
        elif side == max_side:
            count += 1
    return count
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return count')]))

export const phases = [
  { id: 'side', label: 'Side', description: 'The largest square cut from a rectangle has side min(width, height).' },
  { id: 'best', label: 'New best', description: 'A bigger side replaces the best so far and resets the count.' },
  { id: 'tie', label: 'Tie', description: 'An equal side adds one more rectangle to the count.' },
  { id: 'done', label: 'Result', description: 'How many rectangles reach the largest side.' },
]

export const examples = [
  { label: 'Two tied', input: '[[5,8],[3,9],[5,12],[2,2]]' },
  { label: 'One winner', input: '[[4,4],[7,3],[9,5]]' },
]

export const complexity = 'O(n) time and O(1) extra space for n rectangles.'

export function parseInput(text) {
  const rectangles = JSON.parse(text)
  if (!Array.isArray(rectangles) || rectangles.length < 1 || rectangles.length > 20) throw new Error('Use a JSON array of 1 to 20 [width, height] pairs (visual cap).')
  for (const [w, h] of rectangles) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 1000 || h > 1000) throw new Error('Sides are integers from 1 to 1000.')
  }
  return rectangles
}

export function buildTrace(rectangles) {
  const frames = []
  const sides = rectangles.map(([w, h]) => Math.min(w, h))
  let maxSide = 0
  let count = 0
  const snap = extra => ({ maxSide, count, sides, ...extra })
  rectangles.forEach(([w, h], i) => {
    const side = Math.min(w, h)
    frames.push({ phase: 'side', activeLine: 3, index: i, side, message: `Rectangle ${i + 1} (${w}×${h}) gives a square of side ${side}.`, snapshot: snap({}) })
    if (side > maxSide) {
      maxSide = side
      count = 1
      frames.push({ phase: 'best', activeLine: 4, index: i, side, message: `New largest side ${side}: count resets to 1.`, snapshot: snap({}) })
    } else if (side === maxSide) {
      count++
      frames.push({ phase: 'tie', activeLine: 5, index: i, side, message: `Side ${side} ties the best: count ${count}.`, snapshot: snap({}) })
    }
  })
  frames.push({ phase: 'done', activeLine: 7, index: -1, result: count, message: `${count} rectangle${count === 1 ? '' : 's'} with side ${maxSide}.`, snapshot: snap({ result: count }) })
  return { input: rectangles, result: count, frames }
}
