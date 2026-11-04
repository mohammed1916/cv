// Teaching rule: avoid slopes, which need division. Fix the direction from the first two points, then every other point must have zero cross product with that direction.

export const phases = [
  { id: 'start', label: 'Points', description: 'Read the list of points.' },
  { id: 'anchor', label: 'Direction', description: 'The first two points fix a direction vector.' },
  { id: 'check', label: 'Check point', description: 'A point lies on the line when the cross product with the direction is zero.' },
  { id: 'off', label: 'Off line', description: 'This point has a nonzero cross product, so it is not on the line.' },
  { id: 'done', label: 'Result', description: 'Return whether every point passed the check.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"coordinates": [[0,0],[1,1]]}.')
  const { coordinates } = input
  const pair = p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= -10000 && v <= 10000)
  if (!Array.isArray(coordinates) || coordinates.length < 2 || coordinates.length > 1000 || !coordinates.every(pair)) {
    throw new Error('coordinates must be a list of 2 to 1000 [x, y] integer pairs with values from -10000 to 10000.')
  }
  const keys = coordinates.map(p => p.join(','))
  if (new Set(keys).size !== keys.length) throw new Error('Points must be distinct.')
  return { coordinates }
}

export function buildTrace({ coordinates }) {
  const frames = []
  const [[x0, y0], [x1, y1]] = coordinates
  const dx = x1 - x0
  const dy = y1 - y0
  frames.push({
    phase: 'start', activeLine: L('const [x0, y0]'), pythonLine: P('points'),
    message: `${coordinates.length} points. We will test each one against the line through the first two.`,
    snapshot: { points: coordinates, anchor: [x0, y0], direction: null, index: null, cross: null },
  })
  frames.push({
    phase: 'anchor', activeLine: L('const dx = x1'), pythonLine: P('dx, dy'),
    message: `Direction from (${x0},${y0}) to (${x1},${y1}) is (${dx},${dy}). Every point on the line must keep the same cross product with it.`,
    snapshot: { points: coordinates, anchor: [x0, y0], direction: [dx, dy], index: 1, cross: 0 },
  })
  for (let k = 2; k < coordinates.length; k++) {
    const [xk, yk] = coordinates[k]
    const cross = dx * (yk - y0) - dy * (xk - x0)
    if (cross !== 0) {
      frames.push({
        phase: 'off', activeLine: L('return false'), pythonLine: P('return False'),
        message: `Point ${k + 1} is (${xk},${yk}). Its cross product is ${cross}, which is not zero, so it lies off the line.`,
        snapshot: { points: coordinates, anchor: [x0, y0], direction: [dx, dy], index: k, cross },
      })
      frames.push({
        phase: 'done', activeLine: L('return true'), pythonLine: P('return True'),
        message: 'The points are not all on one line.',
        snapshot: { points: coordinates, anchor: [x0, y0], direction: [dx, dy], index: k, cross, verdict: false },
      })
      return { input: { coordinates }, result: false, frames }
    }
    frames.push({
      phase: 'check', activeLine: L('if (cross !== 0)'), pythonLine: P('if cross != 0'),
      message: `Point ${k + 1} is (${xk},${yk}). Its cross product is 0, so it stays on the line.`,
      snapshot: { points: coordinates, anchor: [x0, y0], direction: [dx, dy], index: k, cross: 0 },
    })
  }
  frames.push({
    phase: 'done', activeLine: L('return true'), pythonLine: P('return True'),
    message: 'Every point has zero cross product with the direction, so all points lie on one line.',
    snapshot: { points: coordinates, anchor: [x0, y0], direction: [dx, dy], index: coordinates.length - 1, cross: 0, verdict: true },
  })
  return { input: { coordinates }, result: true, frames }
}

const codeLines = [
  "function checkStraightLine(coordinates) {",
  "  const [x0, y0] = coordinates[0]",
  "  const [x1, y1] = coordinates[1]",
  "  const dx = x1 - x0, dy = y1 - y0",
  "  for (const [xk, yk] of coordinates.slice(2)) {",
  "    const cross = dx * (yk - y0) - dy * (xk - x0)",
  "    if (cross !== 0) return false",
  "  }",
  "  return true",
  "}",
]
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

export const python = `def check_straight_line(coordinates):
    points = coordinates
    (x0, y0), (x1, y1) = points[0], points[1]
    dx, dy = x1 - x0, y1 - y0
    for xk, yk in points[2:]:
        cross = dx * (yk - y0) - dy * (xk - x0)
        if cross != 0:
            return False
    return True`

const pyLines = python.split('\n')
const L = s => {
  const i = codeLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing code line: ${s}`)
  return i + 1
}
const P = s => {
  const i = pyLines.findIndex(t => t.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
