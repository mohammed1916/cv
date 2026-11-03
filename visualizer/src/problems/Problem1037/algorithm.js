export const phases = [
  { id: 'start', label: 'Start', description: 'Read the three points.' },
  { id: 'inspect', label: 'Edge vectors', description: 'Subtract the first point from the other two to get two edge vectors.' },
  { id: 'update', label: 'Cross product', description: 'Compute the 2D cross product of the two edge vectors.' },
  { id: 'done', label: 'Answer', description: 'A nonzero cross product means the points form a triangle.' },
]

const LIMIT = 100

const PSEUDO = [
  'is boomerang(points):',
  '  read P0 = (x0, y0), P1 = (x1, y1), P2 = (x2, y2)',
  '  set a = P1 - P0 as (ax, ay)',
  '  set b = P2 - P0 as (bx, by)',
  '  set cross = ax * by - ay * bx',
  '  return cross is not zero',
]

export const code = PSEUDO.map((text, index) => ({ line: index + 1, text }))

export const python = `def is_boomerang(points):
    (x0, y0), (x1, y1), (x2, y2) = points
    ax, ay = x1 - x0, y1 - y0
    bx, by = x2 - x0, y2 - y0
    cross = ax * by - ay * bx
    return cross != 0
`

export function parseInput(text) {
  let points
  try { points = JSON.parse(text) } catch { throw new Error('Use three points as JSON, such as [[0,0],[1,2],[2,5]].') }
  if (!Array.isArray(points) || points.length !== 3) throw new Error('Give exactly three points.')
  for (const point of points) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(v => Number.isInteger(v) && Math.abs(v) <= LIMIT)) {
      throw new Error(`Each point is [x, y] with integers from -${LIMIT} to ${LIMIT}.`)
    }
  }
  return points.map(([x, y]) => [x, y])
}

export function buildTrace(points) {
  const [[x0, y0], [x1, y1], [x2, y2]] = points
  const ax = x1 - x0
  const ay = y1 - y0
  const bx = x2 - x0
  const by = y2 - y0
  const cross = ax * by - ay * bx
  const result = cross !== 0
  const frames = [
    { phase: 'start', activeLine: 2, pythonLine: 2, message: 'Read the three points P0, P1 and P2.', snapshot: { points } },
    { phase: 'inspect', activeLine: 3, pythonLine: 3, message: `Edge P0 to P1 is (${ax}, ${ay}).`, snapshot: { points, a: [ax, ay], b: null, cross: null } },
    { phase: 'inspect', activeLine: 4, pythonLine: 4, message: `Edge P0 to P2 is (${bx}, ${by}).`, snapshot: { points, a: [ax, ay], b: [bx, by], cross: null } },
    { phase: 'update', activeLine: 5, pythonLine: 5, message: `Cross product ${ax} * ${by} - ${ay} * ${bx} = ${cross}.`, snapshot: { points, a: [ax, ay], b: [bx, by], cross } },
    { phase: 'done', activeLine: 6, pythonLine: 6, message: result ? 'The cross product is nonzero, so the points form a triangle.' : 'The cross product is zero, so the points are collinear or two of them coincide.', snapshot: { points, a: [ax, ay], b: [bx, by], cross } },
  ]
  return { input: points, result, frames }
}
