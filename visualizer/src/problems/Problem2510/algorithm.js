const CODE = [
  'FUNCTION equalPath(grid)',
  '    reach[r][c] ← empty set of balances (zeros minus ones on a path into the cell)',
  '    FOR each cell (r, c) in row-major order',
  '        delta ← +1 if grid[r][c] is 0, otherwise -1',
  '        IF r = 0 and c = 0 THEN reach[0][0] ← {delta}',
  '        ELSE reach[r][c] ← {b + delta for b in reach[r-1][c] ∪ reach[r][c-1]}',
  '    RETURN whether balance 0 is in reach[last row][last column]',
]

const PY = [
  'def equal_path(grid):',
  '    m, n = len(grid), len(grid[0])',
  '    reach = [[set() for _ in range(n)] for _ in range(m)]',
  '    for r in range(m):',
  '        for c in range(n):',
  '            delta = 1 if grid[r][c] == 0 else -1',
  '            if r == 0 and c == 0:',
  '                reach[r][c] = {delta}',
  '                continue',
  '            prev = set()',
  '            if r > 0:',
  '                prev |= reach[r - 1][c]',
  '            if c > 0:',
  '                prev |= reach[r][c - 1]',
  '            reach[r][c] = {b + delta for b in prev}',
  '    return 0 in reach[m - 1][n - 1]',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Start', description: 'Begin at the top-left cell.' },
  { id: 'cell', label: 'Cell', description: 'Collect the balances reachable at this cell.' },
  { id: 'done', label: 'Result', description: 'Check whether balance zero reaches the bottom-right.' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid has 1 to 6 rows in this visualization.')
  const n = grid[0]?.length
  if (!Array.isArray(grid[0]) || n < 1 || n > 6) throw new Error('Each row has 1 to 6 cells in this visualization.')
  if (!grid.every(row => Array.isArray(row) && row.length === n && row.every(v => v === 0 || v === 1))) throw new Error('Cells are 0 or 1 in a rectangle.')
  return grid
}

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const reach = Array.from({ length: m }, () => Array.from({ length: n }, () => new Set()))
  const frames = []
  const snapshot = () => reach.map(row => row.map(s => [...s].sort((a, b) => a - b)))
  frames.push({ pythonLine: pyLine('reach = [[set() for _ in range(n)] for _ in range(m)]'), phase: 'start', activeLine: codeLine('reach[r][c] ← empty set of balances (zeros minus ones on a path into the cell)'), cell: null, delta: null, reach: snapshot(), message: `A ${m} by ${n} grid. Balance counts zeros minus ones on a path, both endpoints included.` })
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
    const delta = grid[r][c] === 0 ? 1 : -1
    if (r === 0 && c === 0) {
      reach[r][c].add(delta)
      frames.push({ pythonLine: pyLine('reach[r][c] = {delta}'), phase: 'cell', activeLine: codeLine('IF r = 0 and c = 0 THEN reach[0][0] ← {delta}'), cell: [r, c], delta, reach: snapshot(), message: `The start cell holds ${grid[r][c]}, so the balance is ${delta}.` })
      continue
    }
    const prev = new Set()
    if (r > 0) for (const b of reach[r - 1][c]) prev.add(b)
    if (c > 0) for (const b of reach[r][c - 1]) prev.add(b)
    for (const b of prev) reach[r][c].add(b + delta)
    frames.push({ pythonLine: pyLine('reach[r][c] = {b + delta for b in prev}'), phase: 'cell', activeLine: codeLine('ELSE reach[r][c] ← {b + delta for b in reach[r-1][c] ∪ reach[r][c-1]}'), cell: [r, c], delta, reach: snapshot(), message: `Cell (${r}, ${c}) holds ${grid[r][c]} (delta ${delta}). Balances reaching it: ${[...reach[r][c]].sort((a, b) => a - b).join(', ') || 'none'}.` })
  }
  const ok = reach[m - 1][n - 1].has(0)
  frames.push({ pythonLine: pyLine('return 0 in reach[m - 1][n - 1]'), phase: 'done', activeLine: codeLine('RETURN whether balance 0 is in reach[last row][last column]'), cell: [m - 1, n - 1], delta: null, reach: snapshot(), message: ok ? 'Balance 0 reaches the bottom-right corner: a balanced path exists.' : 'Balance 0 does not reach the bottom-right corner: no balanced path.' })
  return { input: grid, result: ok, reach: snapshot(), frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
