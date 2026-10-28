const EMPTY = 0
const GUARD = 1
const WALL = 2
const GUARDED = 3
const SYMBOL = ['.', 'G', 'W', 'g']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.m) || !Number.isInteger(input.n) || !Array.isArray(input.guards) || !Array.isArray(input.walls)) throw new Error('Use {"m": rows, "n": columns, "guards": [[r, c], ...], "walls": [[r, c], ...]}.')
  if (input.m < 1 || input.m > 6 || input.n < 1 || input.n > 6) throw new Error('m and n are integers from 1 to 6.')
  const cells = [...input.guards, ...input.walls]
  if (cells.some(cell => !Array.isArray(cell) || cell.length !== 2 || !Number.isInteger(cell[0]) || !Number.isInteger(cell[1]) || cell[0] < 0 || cell[0] >= input.m || cell[1] < 0 || cell[1] >= input.n)) throw new Error('Every guard and wall is a [row, column] inside the grid.')
  const keys = cells.map(cell => cell.join(','))
  if (new Set(keys).size !== keys.length) throw new Error('Guards and walls must all be on different cells.')
  return { m: input.m, n: input.n, guards: input.guards, walls: input.walls }
}

export function buildTrace({ m, n, guards, walls }) {
  const grid = Array.from({ length: m }, () => Array(n).fill(EMPTY))
  walls.forEach(([r, c]) => { grid[r][c] = WALL })
  guards.forEach(([r, c]) => { grid[r][c] = GUARD })
  const display = () => grid.map(row => row.map(v => SYMBOL[v]))
  const frames = [{ phase: 'start', activeLine: L('mark every guard and wall'), guard: null, grid: display(), message: 'Guards and walls are marked; every other cell is empty.' }]
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (const [r, c] of guards) {
    for (const [dr, dc] of dirs) {
      let rr = r + dr
      let cc = c + dc
      while (rr >= 0 && rr < m && cc >= 0 && cc < n && grid[rr][cc] !== GUARD && grid[rr][cc] !== WALL) {
        if (grid[rr][cc] === EMPTY) grid[rr][cc] = GUARDED
        rr += dr
        cc += dc
      }
    }
    frames.push({ phase: 'sweep', activeLine: L('sweep up, down'), guard: [r, c], grid: display(), message: `Guard at row ${r}, column ${c} sweeps out in four directions.` })
  }
  let unguarded = 0
  for (const row of grid) for (const v of row) if (v === EMPTY) unguarded++
  frames.push({ phase: 'done', activeLine: L('return the number of empty cells'), guard: null, grid: display(), message: `${unguarded} empty cells were never seen by a guard.` })
  return { input: { m, n, guards, walls }, result: unguarded, frames }
}

export const code = `count unguarded cells
  mark every guard and wall on the grid
  for each guard
    sweep up, down, left and right
    stop each sweep at a wall or another guard, marking the empty cells passed
  return the number of empty cells that were never marked`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_unguarded(m, n, guards, walls):
    grid = [[0] * n for _ in range(m)]
    for r, c in walls:
        grid[r][c] = 2
    for r, c in guards:
        grid[r][c] = 1
    for r, c in guards:
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            rr, cc = r + dr, c + dc
            while 0 <= rr < m and 0 <= cc < n and grid[rr][cc] not in (1, 2):
                if grid[rr][cc] == 0:
                    grid[rr][cc] = 3
                rr += dr
                cc += dc
    return sum(1 for row in grid for v in row if v == 0)
`
