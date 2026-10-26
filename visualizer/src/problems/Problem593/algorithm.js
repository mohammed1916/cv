export function parseInput(text) {
  const points = JSON.parse(text)
  if (!Array.isArray(points) || points.length !== 4 || points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(v => !Number.isInteger(v) || Math.abs(v) > 10000))) throw new Error('Enter four points as JSON [[x,y],...] with integer coordinates from −10,000 to 10,000.')
  return points
}

const dist2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2

export function buildTrace(points) {
  const pairs = []
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) pairs.push({ a: i, b: j, d: dist2(points[i], points[j]) })
  const frames = [{ phase: 'start', pairs: pairs.map(p => ({ ...p })), sorted: [], activeLine: 2, message: 'Compute the six squared pairwise distances.' }]
  const sorted = [...pairs].sort((x, y) => x.d - y.d)
  frames.push({ phase: 'sort', pairs, sorted: sorted.map(p => ({ ...p })), activeLine: 3, message: `Sorted squared distances: ${sorted.map(p => p.d).join(', ')}.` })
  const [s1, s2, s3, s4, d1, d2] = sorted.map(p => p.d)
  const result = s1 > 0 && s1 === s2 && s2 === s3 && s3 === s4 && d1 === d2 && d1 === 2 * s1
  frames.push({ phase: 'done', pairs, sorted: sorted.map(p => ({ ...p })), result, activeLine: 5, message: result
    ? 'Four equal sides and two equal diagonals of length √2 × side: a square.'
    : 'The distances do not form four equal sides and two equal diagonals.' })
  return { input: points, result, frames }
}

export const code = `def validSquare(p1, p2, p3, p4):
    d = sorted(dist(a, b) for a, b in combinations(points, 2))
    return d[0] > 0 and d[0] == d[1] == d[2] == d[3] and d[4] == d[5] == 2 * d[0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
