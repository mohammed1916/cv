export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.squares)) throw new Error('Use an object with an array squares of [x, y, l] entries.')
  const { squares } = o
  if (squares.length < 1 || squares.length > 6) throw new Error('squares must have 1 to 6 entries.')
  if (squares.some(q => !Array.isArray(q) || q.length !== 3 || !Number.isInteger(q[0]) || !Number.isInteger(q[1]) || !Number.isInteger(q[2]))) throw new Error('Each square is [x, y, l] with integers.')
  if (squares.some(([x, y, l]) => x < 0 || x > 10 || y < 0 || y > 10 || l < 1 || l > 5)) throw new Error('x and y are from 0 to 10, and l is from 1 to 5.')
  return { squares }
}

export function buildTrace({ squares }) {
  const total = squares.reduce((s, [, , l]) => s + l * l, 0)
  const half = total / 2
  const below = line => squares.reduce((s, [, y, l]) => s + l * Math.min(l, Math.max(0, line - y)), 0)
  let low = Math.min(...squares.map(q => q[1]))
  let high = Math.max(...squares.map(q => q[1] + q[2]))
  const frames = [{ phase: 'start', activeLine: L('set low to the lowest'), low, high, mid: null, below: null, message: `Total square area ${total}; the line must leave ${half} on each side.` }]
  for (let it = 0; it < 60; it++) {
    const mid = (low + high) / 2
    const area = below(mid)
    if (area < half) low = mid
    else high = mid
    if (it < 12 || it === 59) frames.push({ phase: 'probe', activeLine: L('if below is less than half'), low, high, mid, below: area, message: `Line at y = ${mid.toFixed(4)} has ${area.toFixed(4)} area below.` })
  }
  const result = high
  frames.push({ phase: 'done', activeLine: L('return high'), low, high, mid: result, below: half, message: `Separating line at y = ${result.toFixed(5)}.` })
  return { input: { squares }, result, frames }
}

export const code = `lowest horizontal line that splits the total square area in half
  let half be half of the total area of the squares
  set low to the lowest square bottom and high to the highest square top
  repeat a fixed number of times
    let mid be the midpoint of low and high
    let below be the area of the squares under mid, each square counting its width times its height inside mid
    if below is less than half then set low to mid, otherwise set high to mid
  return high`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def separate_squares(squares):
    total = sum(l * l for _, _, l in squares)
    half = total / 2

    def below(line):
        return sum(l * min(l, max(0, line - y)) for _, y, l in squares)

    low = min(y for _, y, _ in squares)
    high = max(y + l for _, y, l in squares)
    for _ in range(60):
        mid = (low + high) / 2
        if below(mid) < half:
            low = mid
        else:
            high = mid
    return high
`
