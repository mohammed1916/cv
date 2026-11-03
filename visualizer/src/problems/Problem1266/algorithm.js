export const phases = [
  { id: 'start', label: 'Start', description: 'Start with no time spent. Each move changes x by at most one and y by at most one, so the cost of a leg is set by its larger gap.' },
  { id: 'step', label: 'Price one leg', description: 'Take the horizontal gap dx and the vertical gap dy between two consecutive points. A diagonal step covers both at once, so the leg costs max(dx, dy) moves.' },
  { id: 'done', label: 'Complete', description: 'Return the total over all consecutive legs.' },
]

export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 1 || points.length > 10) throw new Error('Enter a JSON array of 1 to 10 [x, y] points.')
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) {
      throw new Error('Each point is [x, y] with integer coordinates from -100 to 100.')
    }
  }
  return points
}

const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(points) {
  let total = 0
  const snap = (extra = {}) => ({ points, total, ...extra })
  const frames = [{
    phase: 'start', activeLine: L('total = 0'), pythonLine: P('total = 0'), snapshot: snap({ leg: -1 }),
    message: `${points.length} point${points.length === 1 ? '' : 's'} to visit in order. ${points.length < 2 ? 'There is no leg to walk, so the answer is 0.' : 'Price each leg between consecutive points.'}`,
  }]

  for (let i = 0; i + 1 < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)
    const moves = Math.max(dx, dy)
    total += moves
    frames.push({
      phase: 'step', activeLine: L('total += max('), pythonLine: P('total += max('),
      snapshot: snap({ leg: i, from: points[i], to: points[i + 1], dx, dy, moves, total }),
      message: `Leg ${i + 1}: from [${x1}, ${y1}] to [${x2}, ${y2}]. dx = ${dx}, dy = ${dy}. Diagonal steps cover both gaps, so the leg costs ${moves}. Running total ${total}.`,
    })
  }

  frames.push({
    phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: snap({ leg: points.length - 1 }),
    message: `Return ${total}: the sum of all leg costs.`,
  })
  return { input: points, result: total, frames }
}

export const code = [
  'min_time(points):',
  '  total = 0',
  '  for each consecutive pair (a, b):',
  '    dx = |b.x - a.x|, dy = |b.y - a.y|',
  '    total += max(dx, dy)',
  '  return total',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def min_time(points):
    total = 0
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        dx, dy = abs(x2 - x1), abs(y2 - y1)
        total += max(dx, dy)
    return total
`
