// Where the ball falls: follow the grid row by row; a V shape (two neighbouring cells pointing at each other) traps the ball.
const JS_LINES = [
  { text: 'const m = grid.length, n = grid[0].length', py: 'm, n = ' },
  { text: 'const result = []', py: 'result = []' },
  { text: 'for (let col = 0; col < n; col++) {', py: 'for col in range(n)' },
  { text: 'let c = col, ok = true', py: 'c = col' },
  { text: 'for (let r = 0; r < m && ok; r++) {', py: 'for r in range(m)' },
  { text: 'const d = grid[r][c], next = c + d', py: 'd = grid[r][c]' },
  { text: 'if (next < 0 || next >= n || grid[r][next] !== d) ok = false', py: 'if next < 0' },
  { text: 'else c = next', py: 'c = next' },
  { text: '}', py: null },
  { text: 'result.push(ok ? c : -1)', py: 'result.append' },
  { text: '}', py: null },
  { text: 'return result', py: 'return result' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def findBall(grid):
    m, n = len(grid), len(grid[0])
    result = []
    for col in range(n):
        c = col
        ok = True
        for r in range(m):
            d = grid[r][c]
            next = c + d
            if next < 0 or next >= n or grid[r][next] != d:
                ok = False
                break
            c = next
        result.append(c if ok else -1)
    return result
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return result')]))

export const phases = [
  { id: 'drop', label: 'Drop', description: 'Drop a ball from the top of a column.' },
  { id: 'move', label: 'Move', description: 'Each cell sends the ball one column left or right, the way the board is tilted.' },
  { id: 'trap', label: 'Trapped', description: 'The next cell is a wall or points the other way: the ball is stuck.' },
  { id: 'done', label: 'Result', description: 'Where each ball leaves the bottom, or -1 when it is stuck.' },
]

export const examples = [
  { label: 'Ball escapes from the left', input: '[[1,1,1],[1,1,1]]' },
  { label: 'Single column', input: '[[1],[-1]]' },
  { label: 'Single cell', input: '[[1]]' },
  { label: 'Mixed directions', input: '[[1,-1,1],[-1,1,-1]]' },
  { label: 'Largest grid, all right', input: '[[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]]' },
  { label: 'Long run: 6 by 6', input: '[[-1,1,-1,-1,1,1],[-1,-1,1,-1,-1,1],[1,-1,-1,-1,-1,1],[-1,1,-1,-1,-1,-1],[1,-1,1,1,1,1],[-1,-1,-1,-1,-1,-1]]' },
]

export const complexity = 'O(m * n * n) time for an m by n grid, since each ball may move one cell per row. The visual caps the grid at 6 by 6.'

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a grid of 1 to 6 rows (visual cap).')
  const n = grid[0].length
  if (n < 1 || n > 6) throw new Error('Use 1 to 6 columns (visual cap).')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== n) throw new Error('Every row has the same number of columns.')
    if (!row.every(v => v === 1 || v === -1)) throw new Error('Cells hold 1 (move right) or -1 (move left).')
  }
  return grid
}

export function buildTrace(grid) {
  const m = grid.length
  const n = grid[0].length
  const frames = []
  const result = []
  for (let col = 0; col < n; col++) {
    let c = col
    let ok = true
    frames.push({ phase: 'drop', activeLine: 4, col, path: [[0, c]], message: `Drop a ball into column ${col}.`, snapshot: { result: [...result] } })
    const path = [[0, c]]
    for (let r = 0; r < m && ok; r++) {
      const d = grid[r][c]
      const next = c + d
      if (next < 0 || next >= n || grid[r][next] !== d) {
        ok = false
        frames.push({ phase: 'trap', activeLine: 7, col, path: [...path], row: r, message: `Row ${r}: the ball at column ${c} is stuck.`, snapshot: { result: [...result] } })
      } else {
        c = next
        path.push([r, c])
        frames.push({ phase: 'move', activeLine: 8, col, path: [...path], row: r, message: `Row ${r}: the ball moves to column ${c}.`, snapshot: { result: [...result] } })
      }
    }
    if (ok) path.push([m, c])
    result.push(ok ? c : -1)
  }
  frames.push({ phase: 'done', activeLine: 12, col: -1, path: [], result: [...result], message: `Result: [${result.join(', ')}].`, snapshot: { result: [...result] } })
  return { input: grid, result, frames }
}
