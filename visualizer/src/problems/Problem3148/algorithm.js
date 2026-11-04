export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6 || !grid.every(row => Array.isArray(row) && row.length === grid[0].length && row.length >= 1 && row.length <= 6 && row.every(v => Number.isInteger(v) && v >= 1 && v <= 100))) throw new Error('Use a JSON grid of up to 6 by 6 integers from 1 to 100.')
  if (grid.length * grid[0].length < 2) throw new Error('The grid needs at least two cells.')
  return grid
}

export function buildTrace(grid) {
  const frames = []
  const m = grid.length, n = grid[0].length
  const mn = Array.from({ length: m }, () => Array(n).fill(Infinity))
  let best = -Infinity
  frames.push({ mn: mn.map(row => row.slice()), pythonLine: 4, phase: 'start', activeLine: L('let best = -Infinity'), cell: null, prev: null, best, message: 'Scan the grid; each cell can end a path that started above or to the left.' })
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const above = i > 0 ? mn[i - 1][j] : Infinity
      const left = j > 0 ? mn[i][j - 1] : Infinity
      const prev = Math.min(above, left)
      frames.push({ mn: mn.map(row => row.slice()), pythonLine: 8, phase: 'cell', activeLine: L('const prev = Math.min'), cell: [i, j], prev, best, message: `Cell (${i}, ${j}) = ${grid[i][j]}; smallest earlier value reachable is ${prev === Infinity ? 'none' : prev}.` })
      if (prev < Infinity) {
        best = Math.max(best, grid[i][j] - prev)
        frames.push({ mn: mn.map(row => row.slice()), pythonLine: 10, phase: 'score', activeLine: L('if (prev !== Infinity)'), cell: [i, j], prev, best, message: `Score ${grid[i][j] - prev} ending here; best is ${best}.` })
      }
      mn[i][j] = Math.min(grid[i][j], prev)
      frames.push({ mn: mn.map(row => row.slice()), pythonLine: 11, phase: 'store', activeLine: L('mn[i][j] = Math.min'), cell: [i, j], prev, best, message: `Smallest value covering (${i}, ${j}) is ${mn[i][j]}.` })
    }
  }
  frames.push({ mn: mn.map(row => row.slice()), pythonLine: 12, phase: 'done', activeLine: L('return best'), cell: null, prev: null, best, message: `Maximum score: ${best}.` })
  return { input: grid, result: best, frames }
}

export const code = `function maxDifferenceScore(grid) {
  const m = grid.length
  const n = grid[0].length
  let best = -Infinity
  const mn = grid.map(row => row.map(() => Infinity))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const prev = Math.min(i > 0 ? mn[i - 1][j] : Infinity, j > 0 ? mn[i][j - 1] : Infinity)
      if (prev !== Infinity) best = Math.max(best, grid[i][j] - prev)
      mn[i][j] = Math.min(grid[i][j], prev)
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score(grid):
    m, n = len(grid), len(grid[0])
    INF = float("inf")
    best = -INF
    mn = [[INF] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            prev = min(mn[i - 1][j] if i > 0 else INF, mn[i][j - 1] if j > 0 else INF)
            if prev < INF:
                best = max(best, grid[i][j] - prev)
            mn[i][j] = min(grid[i][j], prev)
    return best
`
