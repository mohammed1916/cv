export function parseInput(text) {
  const v = JSON.parse(text)
  if (!Array.isArray(v) || v.length !== 2 || v.some(x => !Number.isInteger(x))) throw new Error('Enter [p, q] as two integers.')
  const [p, q] = v
  if (p < 1 || p > 1000 || q < 1 || q > p) throw new Error('Need 1 <= q <= p <= 1000 (visualization cap).')
  return { p, q }
}

export function buildTrace({ p, q }) {
  const frames = []
  const f = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, a: null, b: null, g: null, m: null, n: null, ...extra })
  f('start', 2, `Room side p = ${p}, laser hits the east wall at height q = ${q}. Unfold the room: the ray becomes a straight line that climbs q per room width.`)
  let a = p, b = q
  while (b) {
    f('gcd', 4, `gcd step: (${a}, ${b}) -> (${b}, ${a % b}).`, { a, b })
    ;[a, b] = [b, a % b]
  }
  const g = a
  const m = p / g, n = q / g
  f('reduce', 5, `gcd = ${g}. The ray first hits a corner after m = p/g = ${m} room widths, by which time it has climbed n = q/g = ${n} room heights (m*q = n*p).`, { g, m, n })
  let result
  if (n % 2 === 0) {
    result = 0
    f('parity', 7, `n = ${n} is even: an even number of heights means the corner is on the bottom edge, which is receptor 0.`, { g, m, n })
  } else if (m % 2 === 1) {
    result = 1
    f('parity', 9, `n = ${n} is odd (top edge) and m = ${m} is odd (east wall): receptor 1.`, { g, m, n })
  } else {
    result = 2
    f('parity', 10, `n = ${n} is odd (top edge) and m = ${m} is even (west wall): receptor 2.`, { g, m, n })
  }
  f('done', 10, `The ray meets receptor ${result} first.`, { g, m, n })
  return { input: { p, q }, result, frames }
}

export const code = `def mirrorReflection(p, q):
    a, b = p, q
    while b:
        a, b = b, a % b
    m, n = p // a, q // a
    if n % 2 == 0:
        return 0
    if m % 2 == 1:
        return 1
    return 2`.split('\n').map((text, index) => ({ line: index + 1, text }))
