const MAX_POINTS = 8
const MAX_RADIUS = 5
const EPS = 1e-7

export function parseInput(text) {
  const data = JSON.parse(text)
  const { points, r } = data ?? {}
  if (!Array.isArray(points) || points.length < 1 || points.length > MAX_POINTS) throw new Error(`points must list 1 to ${MAX_POINTS} pairs.`)
  if (!Number.isInteger(r) || r < 1 || r > MAX_RADIUS) throw new Error(`r must be an integer from 1 to ${MAX_RADIUS}.`)
  const seen = new Set()
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Each point is [x, y] with integers from -10 to 10.')
    const key = `${p[0]},${p[1]}`
    if (seen.has(key)) throw new Error('Points must be distinct.')
    seen.add(key)
  }
  return { points, r }
}

export const code = `maximum darts(points, r)
  set best to 0
  for each point p as the centre
    count the points within r of p and keep the larger count in best
  for each pair a, b of points at most 2r apart
    for each of the two circles of radius r through both a and b
      count the points within r of its centre and keep the larger count in best
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// An optimal circle can be moved until it passes through two darts, or it is centred on one dart.
export function buildTrace({ points, r }) {
  const r2 = r * r
  const covers = (cx, cy) => points.map(([x, y]) => {
    const dx = x - cx
    const dy = y - cy
    return dx * dx + dy * dy <= r2 + EPS
  })
  const countOf = covered => covered.filter(Boolean).length
  const round = v => Math.round(v * 100) / 100
  let best = 0
  let bestCenter = null
  const frames = [{ phase: 'start', center: null, covered: points.map(() => false), best, activeLine: L('set best to 0'), message: `Try circles of radius ${r} that pass through a dart or are centred on one.` }]
  const consider = (phase, cx, cy, text) => {
    const covered = covers(cx, cy)
    const count = countOf(covered)
    if (count > best) { best = count; bestCenter = [cx, cy] }
    frames.push({ phase, center: [cx, cy], covered, best, activeLine: L(phase === 'point' ? 'count the points within r of p' : 'count the points within r of its centre'), message: `${text}: centre (${round(cx)}, ${round(cy)}) covers ${count} dart(s). Best so far: ${best}.` })
  }
  points.forEach(([x, y], i) => consider('point', x, y, `Dart ${i + 1} as the centre`))
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const [x1, y1] = points[i]
      const [x2, y2] = points[j]
      const dx = x2 - x1
      const dy = y2 - y1
      const d2 = dx * dx + dy * dy
      if (d2 === 0 || d2 > 4 * r2) continue
      const d = Math.sqrt(d2)
      const h = Math.sqrt(Math.max(0, r2 - d2 / 4))
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      const ux = -dy / d
      const uy = dx / d
      consider('pair', mx + h * ux, my + h * uy, `Darts ${i + 1} and ${j + 1}, one circle`)
      consider('pair', mx - h * ux, my - h * uy, `Darts ${i + 1} and ${j + 1}, other circle`)
    }
  }
  frames.push({ phase: 'done', center: bestCenter, covered: bestCenter ? covers(...bestCenter) : points.map(() => false), best, activeLine: L('return best'), result: best, message: `The most darts one board of radius ${r} can cover is ${best}.` })
  return { input: { points, r }, result: best, frames }
}

export const python = `import math

def max_darts(points, r):
    eps = 1e-7
    r2 = r * r

    def count(cx, cy):
        total = 0
        for x, y in points:
            dx = x - cx
            dy = y - cy
            if dx * dx + dy * dy <= r2 + eps:
                total += 1
        return total

    best = 0
    for x, y in points:
        best = max(best, count(x, y))
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            x1, y1 = points[i]
            x2, y2 = points[j]
            dx = x2 - x1
            dy = y2 - y1
            d2 = dx * dx + dy * dy
            if d2 == 0 or d2 > 4 * r2:
                continue
            d = math.sqrt(d2)
            h = math.sqrt(max(0, r2 - d2 / 4))
            mx = (x1 + x2) / 2
            my = (y1 + y2) / 2
            ux = -dy / d
            uy = dx / d
            best = max(best, count(mx + h * ux, my + h * uy))
            best = max(best, count(mx - h * ux, my - h * uy))
    return best
`
