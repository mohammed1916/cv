export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with coords, for example {"coords":[[1,1],[1,2],[3,2],[3,3]]}.')
  const { coords } = data
  if (!Array.isArray(coords) || coords.length < 1 || coords.length > 8) throw new Error('coords must have 1 to 8 points.')
  const seen = new Set()
  for (const p of coords) {
    if (!Array.isArray(p) || p.length !== 2 || p.some(x => !Number.isInteger(x) || x < 1 || x > 20)) throw new Error('Each point is [x, y] with integers from 1 to 20.')
    const id = `${p[0]},${p[1]}`
    if (seen.has(id)) throw new Error('Points must be unique.')
    seen.add(id)
  }
  return { coords: coords.map(p => [...p]) }
}

export function buildTrace(input) {
  const { coords } = input
  const n = coords.length
  let best = -1
  let bestTriple = null
  const frames = [{ phase: 'start', activeLine: L('set best to -1'), triple: null, best: -1, message: 'Look for two points on a shared horizontal or vertical line. The third point gives the height.' }]
  // Horizontal side: two points with equal y form the base; the third point must be off that line.
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const [p, q] = [coords[i], coords[j]]
    if (p[1] === q[1]) {
      for (let r = 0; r < n; r++) {
        const dy = Math.abs(coords[r][1] - p[1])
        if (dy === 0) continue
        const cand = Math.abs(p[0] - q[0]) * dy
        if (cand > best) { best = cand; bestTriple = [i, j, r] }
      }
    }
    if (p[0] === q[0]) {
      for (let r = 0; r < n; r++) {
        const dx = Math.abs(coords[r][0] - p[0])
        if (dx === 0) continue
        const cand = Math.abs(p[1] - q[1]) * dx
        if (cand > best) { best = cand; bestTriple = [i, j, r] }
      }
    }
    frames.push({ phase: 'pair', activeLine: L('for each pair of points'), triple: bestTriple, best, message: `Pair ${i} and ${j} checked. Best twice-area so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), triple: bestTriple, best, message: best === -1 ? 'No triangle has a side on an axis line, so the answer is -1.' : `The largest twice-area is ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum triangle area with an axis side (coords)
  set best to -1
  for each pair of points p and q
    if p and q have the same y then
      base is the distance between their x values
      for each other point r with a different y
        candidate is base times the distance of r from that line
        keep candidate in best if it is larger
    if p and q have the same x then
      base is the distance between their y values
      for each other point r with a different x
        candidate is base times the distance of r from that line
        keep candidate in best if it is larger
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_triangle_area(coords):
    n = len(coords)
    best = -1
    for i in range(n):
        for j in range(i + 1, n):
            p, q = coords[i], coords[j]
            if p[1] == q[1]:
                for r in range(n):
                    dy = abs(coords[r][1] - p[1])
                    if dy:
                        best = max(best, abs(p[0] - q[0]) * dy)
            if p[0] == q[0]:
                for r in range(n):
                    dx = abs(coords[r][0] - p[0])
                    if dx:
                        best = max(best, abs(p[1] - q[1]) * dx)
    return best
`
