export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with robots, distance and walls.')
  const { robots, distance, walls } = input
  const ints = (a, lo, hi) => Array.isArray(a) && a.every(v => Number.isInteger(v) && v >= lo && v <= hi)
  if (!ints(robots, 1, 50) || robots.length < 1 || robots.length > 5) throw new Error('robots has 1 to 5 integers from 1 to 50.')
  if (!ints(distance, 1, 10) || distance.length !== robots.length) throw new Error('distance has one integer from 1 to 10 per robot.')
  if (!ints(walls, 1, 50) || walls.length < 1 || walls.length > 12) throw new Error('walls has 1 to 12 integers from 1 to 50.')
  if (new Set(robots).size !== robots.length) throw new Error('Robot positions must be distinct.')
  if (new Set(walls).size !== walls.length) throw new Error('Wall positions must be distinct.')
  return { robots, distance, walls }
}

const fmt = x => (x === -Infinity ? '-inf' : x === Infinity ? 'inf' : String(x))

export function buildTrace({ robots, distance, walls }) {
  const n = robots.length
  const order = robots.map((_, i) => i).sort((a, b) => robots[a] - robots[b])
  const pos = order.map(i => robots[i])
  const reach = order.map(i => distance[i])
  const sorted = [...walls].sort((a, b) => a - b)
  const hits = (a, b) => (a <= b ? sorted.filter(w => w >= a && w <= b).length : 0)
  // Side 0 fires left, side 1 fires right. A neighbouring robot stops the bullet.
  const span = (i, side) => (side === 0
    ? [Math.max(pos[i] - reach[i], i > 0 ? pos[i - 1] + 1 : -Infinity), pos[i]]
    : [pos[i], Math.min(pos[i] + reach[i], i + 1 < n ? pos[i + 1] - 1 : Infinity)])
  const text = ([a, b]) => `${fmt(a)} to ${fmt(b)}`
  const frames = [{ phase: 'start', robot: -1, ranges: [], options: [], best: [0, 0], result: null, pythonLine: P('order = sorted'), activeLine: L('sort the robots'), message: 'Sort the robots left to right. Each bullet stops at a neighbouring robot.' }]
  let best = [hits(...span(0, 0)), hits(...span(0, 1))]
  frames.push({ phase: 'first', robot: 0, ranges: [text(span(0, 0)), text(span(0, 1))], options: [], best: [...best], result: null, pythonLine: P('best = [hits'), activeLine: L('the first robot'), message: `Robot ${pos[0]} alone covers ${best[0]} walls on the left or ${best[1]} on the right.` })
  for (let i = 1; i < n; i++) {
    const previous = best
    const next = [0, 0]
    const options = [0, 1].map(side => {
      const cur = span(i, side)
      const choices = [0, 1].map(prevSide => {
        const p = span(i - 1, prevSide)
        const overlap = hits(Math.max(p[0], cur[0]), Math.min(p[1], cur[1]))
        return { prevSide, value: previous[prevSide] + hits(...cur) - overlap, overlap }
      })
      next[side] = Math.max(...choices.map(c => c.value))
      return { side, range: text(cur), walls: hits(...cur), choices }
    })
    best = next
    frames.push({ phase: 'step', robot: i, ranges: [text(span(i, 0)), text(span(i, 1))], options, best: [...best], result: null, pythonLine: P('for side in'), activeLine: L('for each robot after'), message: `Robot ${pos[i]}: best ending left is ${best[0]}, ending right is ${best[1]}.` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', robot: -1, ranges: [], options: [], best: [...best], result, pythonLine: P('return max(best)'), activeLine: L('return the best'), message: `Best total is ${result} walls.` })
  return { input: { robots, distance, walls }, result, frames, positions: pos }
}

export const code = [
  'sort the robots by position',
  'for each robot, its left and right reach stop at the neighbours',
  'the first robot keeps the walls its bullet covers',
  'for each robot after the first, try both directions',
  'add the new walls and remove the overlap with the previous bullet',
  'return the best total for the last robot',
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import inf

def maximum_walls_destroyed(robots, distance, walls):
    order = sorted(range(len(robots)), key=lambda i: robots[i])
    pos = [robots[i] for i in order]
    reach = [distance[i] for i in order]
    n = len(pos)
    walls = sorted(walls)

    def span(i, side):
        if side == 0:
            low = max(pos[i] - reach[i], pos[i - 1] + 1 if i > 0 else -inf)
            return low, pos[i]
        high = min(pos[i] + reach[i], pos[i + 1] - 1 if i + 1 < n else inf)
        return pos[i], high

    def hits(a, b):
        return sum(1 for w in walls if a <= w <= b) if a <= b else 0

    best = [hits(*span(0, 0)), hits(*span(0, 1))]
    for i in range(1, n):
        new = [0, 0]
        for side in (0, 1):
            cur = span(i, side)
            new[side] = max(
                best[ps] + hits(*cur) - hits(max(span(i - 1, ps)[0], cur[0]), min(span(i - 1, ps)[1], cur[1]))
                for ps in (0, 1))
        best = new
    return max(best)
`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
