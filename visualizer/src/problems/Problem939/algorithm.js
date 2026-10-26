export function parseInput(text) {
  const pts = JSON.parse(text)
  if (!Array.isArray(pts) || pts.length < 1 || pts.length > 30) throw new Error('Enter a JSON array of 1 to 30 points [[x,y],...] (the visualization caps it at 30 points).')
  const seen = new Set()
  for (const p of pts) {
    if (!Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || v < 0 || v > 40000)) throw new Error('Each point must be [x, y] with integers from 0 to 40000.')
    const key = p.join(',')
    if (seen.has(key)) throw new Error(`Duplicate point (${key}); all points must be unique.`)
    seen.add(key)
  }
  return pts
}

export function buildTrace(points) {
  const seen = new Set(points.map(p => p.join(',')))
  let best = Infinity, bestRect = null
  const frames = [{ phase: 'start', activeLine: 2, i: -1, j: -1, best: null, bestRect, message: 'Put every point in a hash set so any corner can be checked in O(1).' }]
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    for (let j = 0; j < i; j++) {
      const [x2, y2] = points[j]
      const diagonal = x1 !== x2 && y1 !== y2
      const has1 = seen.has(`${x1},${y2}`), has2 = seen.has(`${x2},${y1}`)
      if (diagonal && has1 && has2) {
        const area = Math.abs(x1 - x2) * Math.abs(y1 - y2)
        if (area < best) { best = area; bestRect = [x1, y1, x2, y2] }
        frames.push({ phase: 'found', activeLine: 9, i, j, best, bestRect, area, message: `(${x1},${y1}) and (${x2},${y2}) are diagonal corners and both (${x1},${y2}), (${x2},${y1}) exist: area ${area}. Best is ${best}.` })
      } else {
        frames.push({ phase: 'check', activeLine: 8, i, j, best: best === Infinity ? null : best, bestRect,
          message: !diagonal ? `(${x1},${y1}) and (${x2},${y2}) share an x or y: they cannot be opposite corners.` : `Missing corner ${!has1 ? `(${x1},${y2})` : `(${x2},${y1})`}: no rectangle with these diagonal corners.` })
      }
    }
  }
  const result = best === Infinity ? 0 : best
  frames.push({ phase: 'done', activeLine: 10, i: -1, j: -1, best: result, bestRect, message: result ? `Minimum rectangle area is ${result}.` : 'No axis-parallel rectangle exists: return 0.' })
  return { input: points.map(p => [...p]), result, frames }
}

export const code = `def minAreaRect(points):
    seen = set(map(tuple, points))
    best = float('inf')
    for i in range(len(points)):
        x1, y1 = points[i]
        for j in range(i):
            x2, y2 = points[j]
            if x1 != x2 and y1 != y2 and (x1, y2) in seen and (x2, y1) in seen:
                best = min(best, abs(x1 - x2) * abs(y1 - y2))
    return 0 if best == float('inf') else best`.split('\n').map((text, index) => ({ line: index + 1, text }))
