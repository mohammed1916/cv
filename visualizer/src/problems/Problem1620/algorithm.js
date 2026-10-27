export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.towers) || !Number.isInteger(o.radius)) throw new Error('Use an object with a towers list and an integer radius.')
  const { towers, radius } = o
  if (towers.length < 1 || towers.length > 6) throw new Error('towers must have 1 to 6 entries.')
  if (towers.some(t => !Array.isArray(t) || t.length !== 3 || t.some(v => !Number.isInteger(v) || v < 0 || v > 20))) throw new Error('Each tower is [x, y, quality] with integers from 0 to 20.')
  if (radius < 0 || radius > 20) throw new Error('radius must be an integer from 0 to 20.')
  return { towers, radius }
}

const quality = (towers, radius, x, y) => towers.reduce((sum, [tx, ty, q]) => {
  const d2 = (tx - x) ** 2 + (ty - y) ** 2
  return d2 <= radius * radius ? sum + Math.floor(q / (1 + Math.sqrt(d2))) : sum
}, 0)

export function buildTrace({ towers, radius }) {
  const maxX = Math.max(...towers.map(t => t[0]))
  const maxY = Math.max(...towers.map(t => t[1]))
  const grid = Array.from({ length: maxX + 1 }, () => new Array(maxY + 1).fill(0))
  let best = { x: 0, y: 0, q: quality(towers, radius, 0, 0) }
  const frames = [{ phase: 'start', activeLine: L('set best to the origin'), x: 0, y: 0, q: best.q, best: [0, 0], message: 'Start with the origin as the best point so far.' }]
  for (let x = 0; x <= maxX; x++) {
    for (let y = 0; y <= maxY; y++) {
      const q = quality(towers, radius, x, y)
      grid[x][y] = q
      frames.push({ phase: 'scan', activeLine: L('set total to zero'), x, y, q, best: [best.x, best.y], message: `Point (${x}, ${y}) has network quality ${q}.` })
      if (q > best.q) {
        best = { x, y, q }
        frames.push({ phase: 'improve', activeLine: L('set best to this point'), x, y, q, best: [x, y], message: `New best: (${x}, ${y}) with quality ${q}.` })
      }
    }
  }
  const result = [best.x, best.y]
  frames.push({ phase: 'done', activeLine: L('return the best point'), x: best.x, y: best.y, q: best.q, best: result, message: `Best coordinate (${best.x}, ${best.y}) with quality ${best.q}.` })
  return { input: { towers, radius }, result, frames, grid }
}

export const code = `best coordinate for a point with integer coordinates
  set best to the origin with its quality
  for each integer x from 0 to the largest tower x
    for each integer y from 0 to the largest tower y
      set total to zero
      for each tower within the radius of the point
        add floor(tower quality divided by one plus distance) to total
      if total is greater than the best quality then
        set best to this point and its quality
  return the best point`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import math


def best_coordinate(towers, radius):
    def quality(x, y):
        total = 0
        for tx, ty, q in towers:
            d2 = (tx - x) ** 2 + (ty - y) ** 2
            if d2 <= radius * radius:
                total += math.floor(q / (1 + math.sqrt(d2)))
        return total

    max_x = max(t[0] for t in towers)
    max_y = max(t[1] for t in towers)
    best_x, best_y, best_q = 0, 0, quality(0, 0)
    for x in range(max_x + 1):
        for y in range(max_y + 1):
            q = quality(x, y)
            if q > best_q:
                best_x, best_y, best_q = x, y, q
    return [best_x, best_y]
`
