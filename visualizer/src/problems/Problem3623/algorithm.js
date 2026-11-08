const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 4 || input.length > 8) throw new Error('Use a list of 4 to 8 [x, y] points.')
  const seen = new Set()
  for (const point of input) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every(v => Number.isInteger(v) && v >= -1000 && v <= 1000)) {
      throw new Error('Each point is [x, y] with integers from -1000 to 1000.')
    }
    const key = `${point[0]},${point[1]}`
    if (seen.has(key)) throw new Error('Points must be distinct.')
    seen.add(key)
  }
  return input
}

export function buildTrace(points) {
  const frames = []
  const byY = new Map()
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('set total and seen to zero'), level: null, pairs: 0, seen: 0, total: 0, message: 'Start with no horizontal levels counted.' })
  for (const [x, y] of points) {
    byY.set(y, (byY.get(y) ?? 0) + 1)
    frames.push({ pythonLine: P('by_y[y] = '), phase: 'count', activeLine: L('count points at each height'), level: y, pairs: 0, seen: 0, total: 0, message: `Point (${x}, ${y}) joins height ${y}.` })
  }
  let total = 0
  let seen = 0
  for (const [y, count] of byY) {
    const pairs = count * (count - 1) / 2
    frames.push({ pythonLine: P('pairs = count'), phase: 'pairs', activeLine: L('pairs = c times'), level: y, pairs, seen, total, message: `Height ${y} has ${count} point${count === 1 ? '' : 's'}, giving ${pairs} segment${pairs === 1 ? '' : 's'}.` })
    total += seen * pairs
    frames.push({ pythonLine: P('total += seen'), phase: 'add', activeLine: L('add seen times pairs'), level: y, pairs, seen, total, message: `Pair with ${seen} earlier segment${seen === 1 ? '' : 's'}; total ${total}.` })
    seen += pairs
    frames.push({ pythonLine: P('seen += pairs'), phase: 'extend', activeLine: L('add pairs to seen'), level: y, pairs, seen, total, message: `${seen} segment${seen === 1 ? '' : 's'} seen so far.` })
  }
  const result = total % MOD
  frames.push({ pythonLine: P('return total % MOD'), phase: 'done', activeLine: L('return total modulo'), level: null, pairs: 0, seen, total: result, message: `Trapezoid count is ${result}.` })
  return { input: points, result, frames }
}

const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

export const code = `count horizontal trapezoids
  set total and seen to zero
  count points at each height
  for each height with count c
    pairs = c times (c minus 1) divided by 2
    add seen times pairs to total
    add pairs to seen
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `MOD = 10**9 + 7


def count_trapezoids(points):
    by_y = {}
    for x, y in points:
        by_y[y] = by_y.get(y, 0) + 1
    total = 0
    seen = 0
    for count in by_y.values():
        pairs = count * (count - 1) // 2
        total += seen * pairs
        seen += pairs
    return total % MOD
`
