export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.size) || input.size < 1 || input.size > 8) throw new Error('size is an integer from 1 to 8.')
  if (!Array.isArray(input.ships) || input.ships.length > 10) throw new Error('ships is a list of at most 10 cells.')
  const seen = new Set()
  for (const s of input.ships) {
    if (!Array.isArray(s) || s.length !== 2 || !s.every(v => Number.isInteger(v) && v >= 0 && v < input.size)) throw new Error('Each ship is [x, y] inside the grid.')
    const key = s.join(',')
    if (seen.has(key)) throw new Error('Each cell holds at most one ship.')
    seen.add(key)
  }
  return input
}

export function buildTrace({ size, ships }) {
  const lines = []
  const frames = []
  const has = (a, b, c, d) => ships.some(([x, y]) => a <= x && x <= c && b <= y && y <= d)
  const box = (a, b, c, d) => `[${a},${b}] to [${c},${d}]`
  const visit = (a, b, c, d) => {
    if (a > c || b > d) {
      frames.push({ phase: 'empty', pythonLine: PL('if a > c or b > d'), activeLine: L('if (a > c || b > d'), state: [...lines], rect: [a, b, c, d], message: `${box(a, b, c, d)} is empty, so return 0.` })
      return 0
    }
    if (!has(a, b, c, d)) {
      frames.push({ phase: 'oracle', pythonLine: PL('not has_ships'), activeLine: L('if (a > c || b > d || !hasShips'), state: [...lines], rect: [a, b, c, d], message: `Oracle: no ships in ${box(a, b, c, d)}.` })
      return 0
    }
    if (a === c && b === d) {
      lines.push(`ship at [${a},${b}]`)
      frames.push({ phase: 'cell', pythonLine: PL('if a == c and b == d'), activeLine: L('if (a === c && b === d)'), state: [...lines], rect: [a, b, c, d], message: `Single cell [${a},${b}] holds a ship.` })
      return 1
    }
    frames.push({ phase: 'split', pythonLine: PL('if c - a >= d - b'), activeLine: L('const mid = Math.floor((a + c) / 2)'), state: [...lines], rect: [a, b, c, d], message: `${box(a, b, c, d)} has ships: split it.` })
    if (c - a >= d - b) {
      const mid = Math.floor((a + c) / 2)
      return visit(a, b, mid, d) + visit(mid + 1, b, c, d)
    }
    const mid = Math.floor((b + d) / 2)
    return visit(a, b, c, mid) + visit(a, mid + 1, c, d)
  }
  frames.unshift({ phase: 'start', pythonLine: PL('def count_ships'), activeLine: L('return count(x1, y1, x2, y2)'), state: [], message: `Search the ${size} by ${size} grid.` })
  const total = visit(0, 0, size - 1, size - 1)
  frames.push({ phase: 'done', pythonLine: PL('return count(x1, y1, x2, y2)'), activeLine: L('return count(a, b, mid, d)'), state: [...lines], message: `${total} ship${total === 1 ? '' : 's'} found.` })
  return { input: { size, ships }, result: total, frames }
}

export const code = `function countShips(hasShips, x1, y1, x2, y2) {
  const count = (a, b, c, d) => {
    if (a > c || b > d || !hasShips(a, b, c, d)) return 0
    if (a === c && b === d) return 1
    if (c - a >= d - b) {
      const mid = Math.floor((a + c) / 2)
      return count(a, b, mid, d) + count(mid + 1, b, c, d)
    }
    const mid = Math.floor((b + d) / 2)
    return count(a, b, c, mid) + count(a, mid + 1, c, d)
  }
  return count(x1, y1, x2, y2)
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_ships(ships, x1, y1, x2, y2):
    def has_ships(a, b, c, d):
        return any(a <= x <= c and b <= y <= d for x, y in ships)

    def count(a, b, c, d):
        if a > c or b > d or not has_ships(a, b, c, d):
            return 0
        if a == c and b == d:
            return 1
        if c - a >= d - b:
            mid = (a + c) // 2
            return count(a, b, mid, d) + count(mid + 1, b, c, d)
        mid = (b + d) // 2
        return count(a, b, c, mid) + count(a, mid + 1, c, d)

    return count(x1, y1, x2, y2)
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
