// Welzl-style incremental minimum enclosing circle. Points are added in order; when a point falls
// outside the current circle, it must lie on the boundary of the new circle, so the circle is
// rebuilt from that point with the earlier points as candidates for the boundary.

const EPS = 1e-7
const COORD = v => Number.isInteger(v) && v >= -100 && v <= 100

export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 1 || points.length > 8) {
    throw new Error('Use a JSON list of 1 to 8 [x, y] points (visualization cap).')
  }
  for (const p of points) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(COORD)) throw new Error('Each point is [x, y] with integer coordinates from -100 to 100 (visualization cap).')
  }
  return points
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const inside = (p, c) => dist(p, c.center) <= c.radius + EPS

function diameter(a, b) {
  return { center: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], radius: dist(a, b) / 2 }
}

// Circle through three points. Collinear points fall back to the widest pair, which never
// happens inside the algorithm because the boundary points are forced there.
function through(a, b, c) {
  const bx = b[0] - a[0]
  const by = b[1] - a[1]
  const cx = c[0] - a[0]
  const cy = c[1] - a[1]
  const d = 2 * (bx * cy - by * cx)
  if (Math.abs(d) < 1e-12) {
    const pairs = [[a, b], [a, c], [b, c]]
    return pairs.map(([p, q]) => diameter(p, q)).sort((x, y) => y.radius - x.radius)[0]
  }
  const b2 = bx * bx + by * by
  const c2 = cx * cx + cy * cy
  const ux = (cy * b2 - by * c2) / d
  const uy = (bx * c2 - cx * b2) / d
  return { center: [a[0] + ux, a[1] + uy], radius: Math.hypot(ux, uy) }
}

export function buildTrace(points) {
  const frames = []
  const fmt = c => (c ? { center: [c.center[0], c.center[1]], radius: c.radius } : null)
  let circle = null
  const snap = fields => frames.push({ points, circle: fmt(circle), i: -1, j: -1, k: -1, ...fields })

  snap({ phase: 'start', pythonLine: PL('points[0]'), activeLine: L('circle = point 0'), message: `Start with the first point as a circle of radius 0.` })
  circle = { center: [points[0][0], points[0][1]], radius: 0 }
  snap({ phase: 'seed', pythonLine: PL('cx, cy, r ='), activeLine: L('circle = point 0'), message: 'The first point is a circle of radius 0.' })

  for (let i = 1; i < points.length; i++) {
    const pi = points[i]
    if (inside(pi, circle)) {
      snap({ phase: 'inside', i, pythonLine: PL('if inside(pi'), activeLine: L('if point i is inside the circle'), message: `Point ${i} is inside the circle, keep it.` })
      continue
    }
    snap({ phase: 'outside', i, pythonLine: PL('if inside(pi'), activeLine: L('if point i is inside the circle'), message: `Point ${i} is outside, so it must sit on the new boundary.` })
    circle = { center: [pi[0], pi[1]], radius: 0 }
    snap({ phase: 'reset', i, pythonLine: PL('cx, cy, r = pi'), activeLine: L('circle = point i with radius 0'), message: `Rebuild the circle with point ${i} alone.` })
    for (let j = 0; j < i; j++) {
      const pj = points[j]
      if (inside(pj, circle)) {
        snap({ phase: 'inside-pair', i, j, pythonLine: PL('if inside(pj'), activeLine: L('if point j is inside'), message: `Point ${j} is already inside.` })
        continue
      }
      circle = diameter(pi, pj)
      snap({ phase: 'pair', i, j, pythonLine: PL('cx, cy = (pi[0] + pj[0])'), activeLine: L('with i and j as a diameter'), message: `Point ${j} is outside. Try the circle with ${i} and ${j} as a diameter.` })
      for (let k = 0; k < j; k++) {
        const pk = points[k]
        if (inside(pk, circle)) {
          snap({ phase: 'inside-triple', i, j, k, pythonLine: PL('if inside(pk'), activeLine: L('if point k is inside'), message: `Point ${k} is inside the circle through ${i} and ${j}.` })
          continue
        }
        circle = through(pi, pj, pk)
        snap({ phase: 'triple', i, j, k, pythonLine: PL('cx, cy, r = circumcircle'), activeLine: L('circle = the circle through i, j and k'), message: `Point ${k} is outside. Use the circle through ${i}, ${j} and ${k}.` })
      }
    }
  }

  snap({ phase: 'done', pythonLine: PL('return cx, cy, r'), activeLine: L('return the center and radius'), message: `Smallest circle found: center (${round(circle.center[0])}, ${round(circle.center[1])}), radius ${round(circle.radius)}.` })
  return { input: points, result: { center: [circle.center[0], circle.center[1]], radius: circle.radius }, frames }
}

const round = v => Math.round(v * 100000) / 100000

export const code = `smallest circle that encloses every point
  circle = point 0 with radius 0
  for each point i from 1 to n minus 1
    if point i is inside the circle then continue
    circle = point i with radius 0
    for each point j before i
      if point j is inside the circle then continue
      circle = the circle with i and j as a diameter
      for each point k before j
        if point k is inside the circle then continue
        circle = the circle through i, j and k
  return the center and radius of the circle`.split('\n').map((text, index) => ({ line: index + 1, text }))

function L(s) {
  const i = code.findIndex(c => c.text.includes(s))
  if (i < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return i + 1
}

export const python = `import math


def circumcircle(a, b, c):
    bx, by = b[0] - a[0], b[1] - a[1]
    cx, cy = c[0] - a[0], c[1] - a[1]
    d = 2 * (bx * cy - by * cx)
    if abs(d) < 1e-12:
        pairs = [(a, b), (a, c), (b, c)]
        p, q = max(pairs, key=lambda pq: math.dist(pq[0], pq[1]))
        return (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, math.dist(p, q) / 2
    b2 = bx * bx + by * by
    c2 = cx * cx + cy * cy
    ux = (cy * b2 - by * c2) / d
    uy = (bx * c2 - cx * b2) / d
    return a[0] + ux, a[1] + uy, math.hypot(ux, uy)


def min_enclosing_circle(points):
    def inside(p, cx, cy, r):
        return math.dist(p, (cx, cy)) <= r + 1e-7

    cx, cy, r = points[0][0], points[0][1], 0.0
    for i in range(1, len(points)):
        pi = points[i]
        if inside(pi, cx, cy, r):
            continue
        cx, cy, r = pi[0], pi[1], 0.0
        for j in range(i):
            pj = points[j]
            if inside(pj, cx, cy, r):
                continue
            cx, cy = (pi[0] + pj[0]) / 2, (pi[1] + pj[1]) / 2
            r = math.dist(pi, pj) / 2
            for k in range(j):
                pk = points[k]
                if inside(pk, cx, cy, r):
                    continue
                cx, cy, r = circumcircle(pi, pj, pk)
    return cx, cy, r
`

function PL(s) {
  const i = python.split('\n').findIndex(line => line.includes(s))
  if (i < 0) throw new Error(`Missing python line: ${s}`)
  return i + 1
}
