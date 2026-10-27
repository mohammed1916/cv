export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with a grid.')
  const { grid } = data
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 5) throw new Error('grid must have 1 to 5 rows.')
  const cols = Array.isArray(grid[0]) ? grid[0].length : 0
  if (cols < 1 || cols > 5) throw new Error('Each row must have 1 to 5 values.')
  if (grid.some(row => !Array.isArray(row) || row.length !== cols)) throw new Error('Every row must have the same length.')
  if (grid.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 9))) throw new Error('Grid values are integers from 1 to 9.')
  return { grid }
}

const MOD = 1000000007
const STEPS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function buildTrace(input) {
  const { grid } = input
  const rows = grid.length
  const cols = grid[0].length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), cell: null, memo: [], message: 'Count the increasing paths that start at every cell.' }]

  const paths = (r, c) => {
    const key = `${r},${c}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), cell: { row: r, col: c }, memo: snapshot(), message: `Cell (${r}, ${c}) already has ${value} paths.` })
      return value
    }
    let ways = 1
    frames.push({ phase: 'visit', activeLine: L('set ways to 1'), cell: { row: r, col: c }, memo: snapshot(), message: `Cell (${r}, ${c}) with value ${grid[r][c]} always counts itself as one path.` })
    for (const [dr, dc] of STEPS) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] <= grid[r][c]) continue
      ways = (ways + paths(nr, nc)) % MOD
    }
    memo.set(key, ways)
    entries.push({ row: r, col: c, value: ways })
    frames.push({ phase: 'store', activeLine: L('store ways'), cell: { row: r, col: c }, memo: snapshot(), message: `Cell (${r}, ${c}) starts ${ways} paths.` })
    return ways
  }

  let total = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      total = (total + paths(r, c)) % MOD
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), cell: null, memo: snapshot(), message: `Increasing paths in the grid: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count the strictly increasing paths in the grid
  set total to 0
  for each cell (r, c)
    add paths(r, c) to total, modulo 1000000007
  return total

paths(r, c)
  if memo already holds (r, c) then return it
  set ways to 1 for the path that is just this cell
  for each neighbor (nr, nc) of (r, c)
    if the value at (nr, nc) is larger than the value at (r, c) then
      add paths(nr, nc) to ways, modulo 1000000007
  store ways for (r, c) and return ways`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_increasing_paths(grid):
    MOD = 1000000007
    rows = len(grid)
    cols = len(grid[0])
    memo = {}

    def paths(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        ways = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] > grid[r][c]:
                ways = (ways + paths(nr, nc)) % MOD
        memo[(r, c)] = ways
        return ways

    total = 0
    for r in range(rows):
        for c in range(cols):
            total = (total + paths(r, c)) % MOD
    return total
`
