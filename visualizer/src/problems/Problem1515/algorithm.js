const ITER = 400
const EPS = 1e-9

export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.positions)) throw new Error('Use an object with an array positions of [x, y] pairs.')
  const { positions } = o
  if (positions.length < 1 || positions.length > 8) throw new Error('positions must have 1 to 8 points.')
  if (positions.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < 0 || v > 100))) throw new Error('Each point is [x, y] with integers from 0 to 100.')
  return { positions }
}

const total = (pts, x, y) => pts.reduce((s, [px, py]) => s + Math.hypot(px - x, py - y), 0)

export function buildTrace({ positions }) {
  const n = positions.length
  let x = positions.reduce((s, p) => s + p[0], 0) / n
  let y = positions.reduce((s, p) => s + p[1], 0) / n
  const frames = [{ phase: 'start', activeLine: L('start at the average'), x, y, sum: total(positions, x, y), iter: 0, message: `Start at the average of the points, total distance ${total(positions, x, y).toFixed(4)}.` }]
  for (let it = 1; it <= ITER; it++) {
    let wx = 0
    let wy = 0
    let w = 0
    let rx = 0
    let ry = 0
    let eta = 0
    for (const [px, py] of positions) {
      const d = Math.hypot(px - x, py - y)
      if (d < EPS) {
        eta++
        continue
      }
      wx += px / d
      wy += py / d
      w += 1 / d
      rx += (px - x) / d
      ry += (py - y) / d
    }
    if (w > 0) {
      const tx = wx / w
      const ty = wy / w
      const rn = Math.hypot(rx, ry)
      // Vardi and Zhang: when the current point is a data point, keep the part of it the pull cannot move.
      let pull = 0
      if (eta > 0) pull = rn > 0 ? Math.min(1, eta / rn) : 1
      x = (1 - pull) * tx + pull * x
      y = (1 - pull) * ty + pull * y
    }
    if (it <= 60 || it === ITER) frames.push({ phase: 'step', activeLine: L('move the current point'), x, y, sum: total(positions, x, y), iter: it, message: `Iteration ${it}: move to (${x.toFixed(4)}, ${y.toFixed(4)}).` })
  }
  const result = total(positions, x, y)
  frames.push({ phase: 'done', activeLine: L('return the sum'), x, y, sum: result, iter: ITER, message: `Minimum total distance ${result.toFixed(5)}.` })
  return { input: { positions }, result, frames }
}

export const code = `minimum total distance from one point to every service point
  start at the average of the points
  repeat a fixed number of times
    set the weight, the weighted sums, the pull vector and the coincident count to zero
    for each point p
      let d be the distance from the current point to p
      if d is about zero then count p as coincident and skip it
      otherwise add p divided by d to the weighted sums, add one divided by d to the weight, and add the unit vector toward p to the pull
    move the current point toward the weighted average, keeping part of it in place when points coincide
  return the sum of distances from the current point to every point`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math


def min_total_distance(positions):
    x = sum(p[0] for p in positions) / len(positions)
    y = sum(p[1] for p in positions) / len(positions)
    for _ in range(400):
        wx = 0.0
        wy = 0.0
        w = 0.0
        rx = 0.0
        ry = 0.0
        eta = 0
        for px, py in positions:
            d = math.hypot(px - x, py - y)
            if d < 1e-9:
                eta += 1
                continue
            wx += px / d
            wy += py / d
            w += 1 / d
            rx += (px - x) / d
            ry += (py - y) / d
        if w > 0:
            tx = wx / w
            ty = wy / w
            rn = math.hypot(rx, ry)
            pull = 0.0
            if eta > 0:
                pull = min(1.0, eta / rn) if rn > 0 else 1.0
            x = (1 - pull) * tx + pull * x
            y = (1 - pull) * ty + pull * y
    return sum(math.hypot(px - x, py - y) for px, py in positions)
`
