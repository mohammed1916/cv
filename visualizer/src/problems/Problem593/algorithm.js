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

export const code = `calculate the six squared distances between the four points
sort the six distances from smallest to largest
let the side be the smallest distance
require the four smallest distances to equal the side, and the side to be positive
require the two largest distances to be equal and twice the side
return whether all square conditions hold`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports code stages rather than line numbers. This maps each frame onto the lines above.
export function familyLine(frame) {
  if (frame.phase === 'start') return 1
  if (frame.phase === 'done') return 6
  return frame.codeStage === 'classify' ? 4 : 1
}

export const python = `def valid_square(points):
    distances = []
    for first in range(4):
        for second in range(first + 1, 4):
            dx = points[first][0] - points[second][0]
            dy = points[first][1] - points[second][1]
            distances.append(dx * dx + dy * dy)
    distances.sort()
    side = distances[0]
    return (side > 0 and all(d == side for d in distances[:4])
            and distances[4] == distances[5] == 2 * side)`
