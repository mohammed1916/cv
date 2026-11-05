// Sort the lengths from largest to smallest. If three neighbours in that order fail the triangle test with the
// largest of them, no later triple can pass with a bigger perimeter, so the first passing triple is the answer.
export const code = String.raw`function largestPerimeter(sides) {
  const sorted = [...sides].sort((p, q) => q - p); // largest first
  for (let i = 0; i + 2 < sorted.length; i++) {
    const a = sorted[i], b = sorted[i + 1], c = sorted[i + 2];
    if (b + c > a) return a + b + c; // the triangle inequality holds for the two smaller sides
  }
  return 0;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`Missing JavaScript line for "${s}"`); return i + 1 }

export const python = String.raw`def largest_perimeter(sides):
    ordered = sorted(sides, reverse=True)  # largest first
    for i in range(len(ordered) - 2):
        a, b, c = ordered[i], ordered[i + 1], ordered[i + 2]
        if b + c > a:  # the triangle inequality holds for the two smaller sides
            return a + b + c
    return 0`
const PYL = python.split('\n')
const PY = s => { const i = PYL.findIndex(t => t.includes(s)); if (i < 0) throw new Error(`Missing Python line for "${s}"`); return i + 1 }

export const phases = [
  { id: 'sort', label: 'Sort', description: 'Order the lengths from largest to smallest.' },
  { id: 'test', label: 'Test triples', description: 'Test each three neighbours, largest side first.' },
  { id: 'done', label: 'Result', description: 'The first triple that closes is the largest perimeter.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const sides = input && input.sides
  if (!Array.isArray(sides) || sides.length < 3 || sides.length > 12) throw new Error('Use sides: a list of 3 to 12 lengths.')
  if (sides.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Lengths must be integers from 1 to 1000.')
  return { sides }
}

export function buildTrace({ sides }) {
  const sorted = [...sides].sort((p, q) => q - p)
  const frames = [{ phase: 'sort', activeLine: L('const sorted = [...sides]'), pythonLine: PY('ordered = sorted'), sorted, i: null, answer: null,
    message: `Sorted largest first: ${sorted.join(', ')}.` }]
  let answer = 0
  for (let i = 0; i + 2 < sorted.length; i++) {
    const a = sorted[i], b = sorted[i + 1], c = sorted[i + 2]
    const closes = b + c > a
    frames.push({ phase: closes ? 'done' : 'test', activeLine: L(closes ? 'return a + b + c' : 'if (b + c > a)'), pythonLine: PY(closes ? 'return a + b + c' : 'if b + c > a'), sorted, i, answer: closes ? a + b + c : null,
      message: closes ? `${a}, ${b}, ${c}: ${b} + ${c} = ${b + c} is greater than ${a}, so these close a triangle with perimeter ${a + b + c}.`
        : `${a}, ${b}, ${c}: ${b} + ${c} = ${b + c} is not greater than ${a}, so they cannot form a triangle. Try the next three.` })
    if (closes) { answer = a + b + c; break }
  }
  if (answer === 0) frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: PY('return 0'), sorted, i: null, answer: 0, message: 'No three lengths close a triangle, so the answer is 0.' })
  return { input: { sides }, result: answer, frames }
}
