const ADJACENT = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const DIAGONAL = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const METHODS = new Set(['adjacentSum', 'diagonalSum'])

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with grid and calls.')
  const { grid, calls } = input
  if (!Array.isArray(grid) || grid.length < 3 || grid.length > 5) throw new Error('grid is a square with side 3 to 5.')
  const n = grid.length
  const seen = new Set()
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('grid must be square.')
    for (const v of row) {
      if (!Number.isInteger(v) || v < 0 || v >= n * n || seen.has(v)) throw new Error(`Values must be distinct whole numbers from 0 to ${n * n - 1}.`)
      seen.add(v)
    }
  }
  if (!Array.isArray(calls) || calls.length < 1 || calls.length > 12) throw new Error('calls has 1 to 12 entries.')
  for (const c of calls) {
    if (!Array.isArray(c) || c.length !== 2 || !METHODS.has(c[0]) || !Number.isInteger(c[1]) || !seen.has(c[1])) throw new Error('Each call is ["adjacentSum" or "diagonalSum", value in the grid].')
  }
  return { grid, calls }
}

// Store where every value sits, then answer each query by looking at its neighbours.
export function buildTrace({ grid, calls }) {
  const n = grid.length
  const where = new Map()
  grid.forEach((row, r) => row.forEach((v, c) => where.set(v, [r, c])))
  const frames = [{ pythonLine: PL('self.where = '), phase: 'build', activeLine: L('where.set(v, [r, c])'), cell: null, neighbours: [], sum: null, answers: [null], message: `Stored the positions of ${n * n} values.` }]
  const answers = [null]
  for (const [method, value] of calls) {
    const [r, c] = where.get(value)
    frames.push({ pythonLine: PL('r, c = '), phase: 'locate', activeLine: L('const [r, c] = where.get(value)'), cell: [r, c], neighbours: [], sum: null, method, answers: [...answers], message: `${value} sits at row ${r}, column ${c}.` })
    const offsets = method === 'adjacentSum' ? ADJACENT : DIAGONAL
    const neighbours = offsets
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n)
      .map(([nr, nc]) => ({ at: [nr, nc], value: grid[nr][nc] }))
    const sum = neighbours.reduce((total, x) => total + x.value, 0)
    answers.push(sum)
    frames.push({ pythonLine: PL('return total'), phase: 'sum', activeLine: L('const sum = neighbours.reduce'), cell: [r, c], neighbours, sum, method, answers: [...answers], message: `${method === 'adjacentSum' ? 'Top, bottom, left and right' : 'The four diagonal'} neighbours of ${value} add to ${sum}.` })
  }
  frames.push({ pythonLine: PL('def diagonalSum'), phase: 'done', activeLine: L('return answers'), cell: null, neighbours: [], sum: null, answers: [...answers], message: 'All queries answered.' })
  return { input: { grid, calls }, result: answers, frames }
}

export const code = `function neighbourSums(grid, calls) {
  const n = grid.length
  const where = new Map()
  grid.forEach((row, r) => row.forEach((v, c) => where.set(v, [r, c])))
  const answers = [null]
  for (const [method, value] of calls) {
    const [r, c] = where.get(value)
    const offsets = method === 'adjacentSum' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    const neighbours = offsets
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n)
    const sum = neighbours.reduce((total, [nr, nc]) => total + grid[nr][nc], 0)
    answers.push(sum)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `class NeighborSum:
    def __init__(self, grid):
        self.grid = grid
        self.where = {v: (r, c) for r, row in enumerate(grid) for c, v in enumerate(row)}

    def _sum(self, value, offsets):
        r, c = self.where[value]
        total = 0
        for dr, dc in offsets:
            if 0 <= r + dr < len(self.grid) and 0 <= c + dc < len(self.grid):
                total += self.grid[r + dr][c + dc]
        return total

    def adjacentSum(self, value):
        return self._sum(value, [(-1, 0), (1, 0), (0, -1), (0, 1)])

    def diagonalSum(self, value):
        return self._sum(value, [(-1, -1), (-1, 1), (1, -1), (1, 1)])`
const PL = s => python.split('\n').findIndex(line => line.includes(s)) + 1
