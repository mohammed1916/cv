export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with points and w.')
  const { points, w } = input
  if (!Array.isArray(points) || points.length < 1 || points.length > 12) throw new Error('points has 1 to 12 pairs.')
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 0 && v <= 40)) throw new Error('Each point is [x, y] with whole numbers from 0 to 40.')
  }
  if (!Number.isInteger(w) || w < 0 || w > 40) throw new Error('w is a whole number from 0 to 40.')
  return { points, w }
}

// Rectangles can be as tall as needed, so only the x coordinates matter.
// Sweep the distinct x values from the left: the first uncovered x starts a rectangle that reaches x + w.
export function buildTrace({ points, w }) {
  const xs = [...new Set(points.map(([x]) => x))].sort((a, b) => a - b)
  const frames = []
  let start = null
  let count = 0
  const covered = []
  frames.push({ pythonLine: PL('xs = sorted'), phase: 'sort', activeLine: L('const xs = [...new Set'), start: null, end: null, covered: [], count, message: `Distinct x values: ${xs.join(', ')}. Heights do not matter.` })
  for (const x of xs) {
    if (start !== null && x <= start + w) {
      covered.push(x)
      frames.push({ pythonLine: PL('if start is not None'), phase: 'cover', activeLine: L('if (start !== null && x <= start + w)'), start, end: start + w, covered: [...covered], count, x, message: `${x} lies inside the rectangle from ${start} to ${start + w}.` })
      continue
    }
    start = x
    count += 1
    covered.push(x)
    frames.push({ pythonLine: PL('start = x'), phase: 'place', activeLine: L('start = x'), start, end: start + w, covered: [...covered], count, x, message: `${x} is uncovered, so place rectangle ${count} from ${start} to ${start + w}.` })
  }
  frames.push({ pythonLine: PL('return count'), phase: 'done', activeLine: L('return count'), start: null, end: null, covered: [...covered], count, x: null, message: `${count} rectangle${count === 1 ? '' : 's'} cover every point.` })
  return { input: { points, w }, result: count, xs, frames }
}

export const code = `function minRectangles(points, w) {
  const xs = [...new Set(points.map(([x]) => x))].sort((a, b) => a - b)
  let start = null
  let count = 0
  for (const x of xs) {
    if (start !== null && x <= start + w) continue
    start = x
    count += 1
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_rectangles(points, w):
    xs = sorted({x for x, _ in points})
    count = 0
    start = None
    for x in xs:
        if start is not None and x <= start + w:
            continue
        start = x
        count += 1
    return count`
const PL = s => python.split('\n').findIndex(line => line.includes(s)) + 1
