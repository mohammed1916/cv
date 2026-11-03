export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with target and drones.')
  const { target, drones } = input
  const coord = v => Number.isInteger(v) && v >= -25 && v <= 25
  if (!Array.isArray(target) || target.length !== 2 || !target.every(coord)) throw new Error('target is [x, y] with coordinates from -25 to 25.')
  if (!Array.isArray(drones) || drones.length < 1 || drones.length > 10) throw new Error('drones lists 1 to 10 drones.')
  for (const d of drones) {
    if (!Array.isArray(d) || d.length !== 3 || !coord(d[0]) || !coord(d[1])) throw new Error('Each drone is [x, y, range] with coordinates from -25 to 25.')
    if (!Number.isInteger(d[2]) || d[2] < 1 || d[2] > 100) throw new Error('Each range is an integer from 1 to 100.')
  }
  return { target, drones }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ target, drones }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const [tx, ty] = target
  let best = -1
  let bestDistance = Infinity
  frames.push({ phase: 'start', activeLine: L('best = none'), pythonLine: P('best, best_dist'), index: -1, distance: null, range: null, reachable: null, best, bestDistance: null, message: `Target (${tx}, ${ty}). Check drones in index order.` })
  drones.forEach(([x, y, range], i) => {
    const distance = Math.abs(x - tx) + Math.abs(y - ty)
    const reachable = distance <= range
    const takes = reachable && distance < bestDistance
    if (takes) {
      best = i
      bestDistance = distance
    }
    frames.push({ phase: takes ? 'take' : reachable ? 'tie' : 'out', activeLine: L('if the distance is within the range'), pythonLine: P('if dist <= rng'), index: i, distance, range, reachable, best, bestDistance: bestDistance === Infinity ? null : bestDistance, message: !reachable ? `Drone ${i} is ${distance} away with range ${range}: out of reach.` : takes ? `Drone ${i} reaches at distance ${distance}; it is the nearest so far.` : `Drone ${i} reaches at distance ${distance}, not closer than drone ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), index: -1, distance: null, range: null, reachable: null, best, bestDistance: bestDistance === Infinity ? null : bestDistance, result: best, message: best === -1 ? 'No drone reaches the target, so the answer is -1.' : `Drone ${best} is the nearest reachable drone.` })
  return { input: { target, drones }, result: best, frames }
}

export const code = `nearest reachable drone to the target
best = none and bestDistance = infinity
for each drone i in index order
  distance = |x minus target x| plus |y minus target y|
  if the distance is within the range and is less than bestDistance
    best = i and bestDistance = distance
return best, or -1 when no drone reached the target`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def nearest_available_drone(target, drones):
    tx, ty = target
    best, best_dist = -1, float('inf')
    for i, (x, y, rng) in enumerate(drones):
        dist = abs(x - tx) + abs(y - ty)
        if dist <= rng and dist < best_dist:
            best, best_dist = i, dist
    return best
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
