export function parseInput(text) {
  const pts = JSON.parse(text)
  if (!Array.isArray(pts) || pts.length < 3 || pts.length > 10 || !pts.every(p => Array.isArray(p) && p.length === 2 && p.every(v => Number.isInteger(v) && v >= -50 && v <= 50))) throw new Error('Enter a JSON array of 3-10 integer points [x, y] with coordinates in [-50, 50] (visualization caps).')
  return pts.map(p => [...p])
}
export const doubleArea = (a, b, c) => Math.abs(a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
export function buildTrace(points) {
  const n = points.length
  const frames = []
  let best = 0, bestTriple = null
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, best: best / 2, bestTriple: bestTriple && [...bestTriple], triple: null, area: null, ...extra })
  push('start', L('set best to 0'), 'With at most 10 points we can afford every triple; area comes from the shoelace formula.')
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    const d = doubleArea(points[i], points[j], points[k])
    const improved = d > best
    if (improved) { best = d; bestTriple = [i, j, k] }
    push(improved ? 'improve' : 'try', improved ? L('if area is greater') : L('set area to the shoelace'), `Points ${i}, ${j}, ${k}: area = |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)| / 2 = ${d / 2}. ${improved ? 'New best.' : `Not above best ${(best) / 2}.`}`, { triple: [i, j, k], area: d / 2 })
  }
  push('done', L('return best'), `Largest triangle area: ${best / 2}.`)
  return { input: points, result: best / 2, frames }
}
export const code = `set best to 0
set n to the number of points
for each i from 0 to n - 1
  for each j from i + 1 to n - 1
    for each k from j + 1 to n - 1
      set area to the shoelace area of triangle points i, j, k
      if area is greater than best, set best to area
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_triangle_area(points):
    best = 0.0
    n = len(points)
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                (x1, y1), (x2, y2), (x3, y3) = points[i], points[j], points[k]
                area = abs(x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2
                if area > best:
                    best = area
    return best
`
