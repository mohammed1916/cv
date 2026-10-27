const MAX_SIZE = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  const grid = data?.grid
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > MAX_SIZE) throw new Error(`grid must have 1 to ${MAX_SIZE} rows.`)
  const cols = typeof grid[0] === 'string' ? grid[0].length : 0
  if (cols < 1 || cols > MAX_SIZE) throw new Error(`Each row must have 1 to ${MAX_SIZE} cells.`)
  for (const row of grid) {
    if (typeof row !== 'string' || row.length !== cols) throw new Error('Every row must be a string of the same length.')
    if (![...row].every(ch => ch === '(' || ch === ')')) throw new Error("Use only '(' and ')' in the grid.")
  }
  return { grid }
}

export const code = `has valid path(grid):
  if the top-left is not ( or the bottom-right is not ) return false
  if rows + cols - 1 is odd return false
  set balances to an empty set for every cell, and set the top-left balances to {1}
  for each other cell in row-major order:
    collect the balances from the cell above and the cell to the left
    move each balance by +1 for ( or -1 for )
    keep only balances that are 0 or more and store them for this cell
  return whether 0 is among the balances at the bottom-right`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const m = grid.length
  const n = grid[0].length
  const sets = Array.from({ length: m }, () => Array(n).fill(null))
  const view = () => sets.map(row => row.map(s => (s === null ? '·' : s.length ? `{${s.join(',')}}` : '∅')))
  const frames = []
  let result
  if (grid[0][0] !== '(' || grid[m - 1][n - 1] !== ')') {
    frames.push({ phase: 'early', activeLine: L('if the top-left'), row: 0, col: 0, table: view(), message: 'A valid path must start with ( and end with ), so none exists.' })
    result = false
  } else if ((m + n - 1) % 2 === 1) {
    frames.push({ phase: 'early', activeLine: L('if rows + cols'), row: 0, col: 0, table: view(), message: `A path has ${m + n - 1} cells, an odd number, so it cannot balance.` })
    result = false
  } else {
    sets[0][0] = [1]
    frames.push({ phase: 'start', activeLine: L('set the top-left balances'), row: 0, col: 0, table: view(), message: 'The first ( gives balance 1.' })
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        if (r === 0 && c === 0) continue
        const previous = []
        if (r > 0) previous.push(...sets[r - 1][c])
        if (c > 0) previous.push(...sets[r][c - 1])
        const delta = grid[r][c] === '(' ? 1 : -1
        sets[r][c] = [...new Set(previous.map(b => b + delta).filter(b => b >= 0))].sort((a, b) => a - b)
        frames.push({ phase: 'cell', activeLine: L('keep only balances'), row: r, col: c, table: view(), message: `Cell (${r}, ${c}) ${grid[r][c]}: reachable balances ${sets[r][c].length ? sets[r][c].join(', ') : 'none'}.` })
      }
    }
    result = sets[m - 1][n - 1].includes(0)
  }
  frames.push({ phase: 'done', activeLine: L('return whether 0'), row: m - 1, col: n - 1, table: view(), message: result ? 'Balance 0 is reachable at the bottom-right: a valid path exists.' : 'Balance 0 is not reachable at the bottom-right.' })
  return { input: { grid }, grid, result, frames }
}

export const python = `def has_valid_path(grid):
    m, n = len(grid), len(grid[0])
    if grid[0][0] != '(' or grid[m - 1][n - 1] != ')':
        return False
    if (m + n - 1) % 2 == 1:
        return False
    balances = [[set() for _ in range(n)] for _ in range(m)]
    balances[0][0] = {1}
    for r in range(m):
        for c in range(n):
            if r == 0 and c == 0:
                continue
            previous = set()
            if r > 0:
                previous |= balances[r - 1][c]
            if c > 0:
                previous |= balances[r][c - 1]
            delta = 1 if grid[r][c] == '(' else -1
            balances[r][c] = {b + delta for b in previous if b + delta >= 0}
    return 0 in balances[m - 1][n - 1]
`
