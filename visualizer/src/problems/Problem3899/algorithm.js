export function parseInput(text) {
  const sides = JSON.parse(text)
  if (!Array.isArray(sides) || sides.length !== 3 || sides.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Enter exactly three integer side lengths between 1 and 1000, for example [3,4,5].')
  return sides
}
export function buildTrace(input) {
  const sides = [...input].sort((a, b) => a - b), [a, b, c] = sides
  const angles = []
  const frames = [{ phase: 'start', index: -1, angles: [], activeLine: 3, message: 'Sort the three side lengths. Larger sides have larger opposite angles.' },
    { phase: 'check', index: -1, angles: [], activeLine: 4, message: `${a} + ${b} ${a + b > c ? '>' : '≤'} ${c}: ${a + b > c ? 'positive-area triangle exists' : 'no positive-area triangle'}.` }]
  if (a + b > c) {
    for (let i = 0; i < 3; i++) {
      const opposite = sides[i], first = sides[(i + 1) % 3], second = sides[(i + 2) % 3]
      const numerator = first * first + second * second - opposite * opposite
      const denominator = 2 * first * second
      const cosine = Math.max(-1, Math.min(1, numerator / denominator))
      angles.push(Math.acos(cosine) * 180 / Math.PI)
      frames.push({ phase: 'angle', index: i, angles: [...angles], numerator, denominator, cosine, activeLine: 10,
        message: `Angle ${'ABC'[i]}, opposite side ${opposite}: acos(${numerator}/${denominator}) × 180/π = ${angles[i].toFixed(8)}°.` })
    }
  }
  const result = [...angles].sort((x, y) => x - y)
  frames.push({ phase: 'done', index: -1, angles: [...angles], activeLine: result.length ? 11 : 5,
    message: result.length ? 'Return the three angles in non-decreasing order, retaining full numerical precision.' : 'Return []: equality gives zero area, and a larger longest side cannot close the triangle.' })
  return { input: [...input], sides, valid: a + b > c, result, frames }
}
export const code = `import math
def triangleAngles(sides):
    a, b, c = sorted(sides)
    if a + b <= c:
        return []
    angles = []
    for opposite, u, v in [(a,b,c), (b,a,c), (c,a,b)]:
        cosine = (u*u + v*v - opposite*opposite) / (2*u*v)
        cosine = max(-1.0, min(1.0, cosine))
        angles.append(math.degrees(math.acos(cosine)))
    return sorted(angles)`.split('\n').map((text, index) => ({ line: index + 1, text }))

export function trianglePoints(sides) {
  const [a, b, c] = sides
  const x = (b * b + c * c - a * a) / (2 * c)
  const y = Math.sqrt(Math.max(0, b * b - x * x))
  return [[0, 0], [c, 0], [x, y]]
}
