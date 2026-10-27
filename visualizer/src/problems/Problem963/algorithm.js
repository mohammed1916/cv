export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length < 1 || points.length > 12) throw new Error('Use 1 to 12 points.')
  if (points.some(p => !Array.isArray(p) || p.length !== 2 || !p.every(v => Number.isInteger(v) && Math.abs(v) <= 10))) {
    throw new Error('Each point is [x, y] with integers from -10 to 10.')
  }
  const keys = new Set(points.map(p => p.join(',')))
  if (keys.size !== points.length) throw new Error('Points must be distinct.')
  return points
}

const key = ([x, y]) => `${x},${y}`

export function buildTrace(points) {
  const present = new Set(points.map(key))
  let best = Infinity
  let bestCorner = null
  const frames = [{ phase: 'start', activeLine: L('set best to none'), corner: null, arms: null, area: null, best: null, message: 'A rectangle has a right angle at each corner. Try each point as the corner, with two perpendicular arms.' }]
  for (const p1 of points) {
    for (const p0 of points) {
      for (const p2 of points) {
        if (p0 === p1 || p2 === p1 || p0 === p2) continue
        const a = [p0[0] - p1[0], p0[1] - p1[1]], b = [p2[0] - p1[0], p2[1] - p1[1]]
        if (a[0] * b[0] + a[1] * b[1] !== 0) continue
        const fourth = [p0[0] + p2[0] - p1[0], p0[1] + p2[1] - p1[1]]
        if (!present.has(key(fourth))) continue
        const area = Math.sqrt((a[0] ** 2 + a[1] ** 2) * (b[0] ** 2 + b[1] ** 2))
        if (area < best) {
          best = area
          bestCorner = p1
        }
        frames.push({ phase: 'rectangle', activeLine: L('set area to'), corner: p1, arms: [p0, p2], area, best, message: `Corner ${key(p1)} with arms to ${key(p0)} and ${key(p2)} closes at ${key(fourth)}: area ${area.toFixed(3)}.` })
      }
    }
  }
  const result = best === Infinity ? 0 : best
  frames.push({ phase: 'done', activeLine: L('return best, or 0'), corner: bestCorner, arms: null, area: null, best: result, message: result ? `Smallest rectangle area: ${result.toFixed(5)}.` : 'No rectangle exists.' })
  return { input: points, result, frames }
}

export const code = `minAreaFreeRect(points) returns the smallest rectangle area, or 0 if there is none
  put every point into a set called present
  set best to none
  for each point p1, as the corner
    for each point p0, then each point p2, other than p1
      if the arms (p0 minus p1) and (p2 minus p1) are not perpendicular, then skip
      set fourth to p0 plus p2 minus p1
      if fourth is not in present, then skip
      set area to the length of arm (p0 minus p1) times the length of arm (p2 minus p1)
      set best to the smaller of best and area
  return best, or 0 if best is none`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math

def min_area_free_rect(points):
    present = set(map(tuple, points))
    best = None
    for p1 in points:
        for p0 in points:
            for p2 in points:
                if p0 == p1 or p2 == p1 or p0 == p2:
                    continue
                a = (p0[0] - p1[0], p0[1] - p1[1])
                b = (p2[0] - p1[0], p2[1] - p1[1])
                if a[0] * b[0] + a[1] * b[1] != 0:
                    continue
                fourth = (p0[0] + p2[0] - p1[0], p0[1] + p2[1] - p1[1])
                if fourth not in present:
                    continue
                area = math.sqrt((a[0] ** 2 + a[1] ** 2) * (b[0] ** 2 + b[1] ** 2))
                best = area if best is None else min(best, area)
    return best or 0`
