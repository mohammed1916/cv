export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 1 || points.length > 10) throw new Error('Enter 1 to 10 points as [day, price] pairs.')
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each point is [day, price] with integers from 1 to 20.')
  }
  const days = new Set(points.map(p => p[0]))
  if (days.size !== points.length) throw new Error('Each day appears only once.')
  return points
}

export function buildTrace(points) {
  const sorted = points.map(p => p.slice()).sort((a, b) => a[0] - b[0])
  if (sorted.length === 1) {
    return { input: points, result: 0, frames: [{ phase: 'single', index: null, lines: 0, activeLine: L('return 0'), message: 'One point needs no line.', sorted }, { phase: 'done', index: null, lines: 0, activeLine: L('return 0'), message: 'Minimum lines: 0.', sorted }] }
  }
  let lines = 1
  const frames = [{ phase: 'start', index: null, lines, activeLine: L('set lines to 1'), message: 'The first segment needs one line. Each slope change needs another.', sorted }]
  for (let i = 1; i < sorted.length - 1; i++) {
    const [x0, y0] = sorted[i - 1], [x1, y1] = sorted[i], [x2, y2] = sorted[i + 1]
    // Compare the slopes (y1 - y0) / (x1 - x0) and (y2 - y1) / (x2 - x1) without division.
    const same = (y1 - y0) * (x2 - x1) === (y2 - y1) * (x1 - x0)
    if (!same) lines++
    frames.push({ phase: 'turn', index: i, same, lines, activeLine: L('are different'), message: same ? `Points ${i - 1}, ${i}, ${i + 1} lie on one line: no new segment.` : `The slope changes at point ${i}: a new line is needed.`, sorted })
  }
  frames.push({ phase: 'done', index: null, lines, activeLine: L('return lines'), message: `Minimum lines: ${lines}.`, sorted })
  return { input: points, result: lines, frames }
}

export const code = `minimum number of lines through the points of a chart
  sort the points by day
  if there is one point then return 0
  set lines to 1
  for each point b that has a point a before it and a point c after it
    if the slopes a to b and b to c are different then
      add 1 to lines
  return lines`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_lines(stock_prices):
    pts = sorted(stock_prices)
    if len(pts) == 1:
        return 0
    lines = 1
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        if (y1 - y0) * (x2 - x1) != (y2 - y1) * (x1 - x0):
            lines += 1
    return lines
`
