// Original teaching model. The sample grids are invented for this visualization.
// Run lengths are precomputed once; each top-left corner then tests square sides from largest to smallest.

export const phases = [
  { id: 'runs', label: 'Runs', description: 'Measure how far ones continue to the right and downward from every cell.' },
  { id: 'corners', label: 'Corners', description: 'Pick a top-left corner and the largest side its two runs allow.' },
  { id: 'check', label: 'Border check', description: 'Confirm the bottom and right edges of a candidate square.' },
  { id: 'done', label: 'Result', description: 'Report the area of the largest square whose border is all ones.' },
]

export const code = [
  'right[i][j] = ones in a row run starting at (i, j) going right',
  'down[i][j] = ones in a column run starting at (i, j) going down',
  'best = 0',
  'for each top-left cell (i, j) that holds a one:',
  '  for size from min(right, down) down to best + 1:',
  '    the bottom edge starts at (i + size - 1, j) and the right edge at (i, j + size - 1)',
  '    if right[i + size - 1][j] >= size and down[i][j + size - 1] >= size:',
  '      best = size, so smaller sides need no checks here',
  'return best * best',
].map((text, index) => ({ line: index + 1, text }))

const at = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing code line: ${key}`)
  return index + 1
}

export const python = `def largest_bordered_square(grid):
    n, m = len(grid), len(grid[0])
    right = [[0] * (m + 1) for _ in range(n + 1)]
    down = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(n - 1, -1, -1):
        for j in range(m - 1, -1, -1):
            if grid[i][j]:
                right[i][j] = right[i][j + 1] + 1
                down[i][j] = down[i + 1][j] + 1
    best = 0
    for i in range(n):
        for j in range(m):
            if not grid[i][j]:
                continue
            for size in range(min(right[i][j], down[i][j]), best, -1):
                if right[i + size - 1][j] >= size and down[i][j + size - 1] >= size:
                    best = size
                    break
    return best * best`

export const inputLabel = 'Grid of 0s and 1s (JSON array of rows)'
export const complexity = 'Run lengths take O(rows × columns). The corner checks take O(rows × columns × side) in the worst case.'
export const examples = [
  { label: 'Sample', input: '[[1,1,1,0,1],[1,0,1,1,1],[1,1,1,1,0],[0,1,1,1,1],[1,1,0,1,1]]' },
  { label: 'Single one', input: '[[0,0],[0,1]]' },
  { label: 'No ones', input: '[[0,0],[0,0]]' },
]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || !Array.isArray(grid[0])) throw new Error('Enter a JSON array of 1 to 8 rows.')
  const width = grid[0].length
  if (width < 1 || width > 8) throw new Error('Each row needs 1 to 8 cells.')
  grid.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== width) throw new Error(`Row ${i + 1} must have ${width} cells, the same as row 1.`)
    row.forEach(cell => { if (cell !== 0 && cell !== 1) throw new Error('Cells must be 0 or 1.') })
  })
  return grid
}

export function buildTrace(grid) {
  const n = grid.length, m = grid[0].length
  const right = grid.map(row => row.map(() => 0))
  const down = grid.map(row => row.map(() => 0))
  const frames = []
  const snap = extra => ({ grid, right: right.map(row => [...row]), down: down.map(row => [...row]), corner: null, size: null, best: 0, ...extra })
  const push = (phase, key, message, extra = {}) => frames.push({ phase, activeLine: at(key), message, snapshot: snap(extra) })

  push('runs', 'right[i][j] =', `The grid has ${n} rows and ${m} columns. Start with the run of ones going right, scanning each row from its last cell.`)
  for (let i = 0; i < n; i++) {
    for (let j = m - 1; j >= 0; j--) right[i][j] = grid[i][j] ? (j + 1 < m ? right[i][j + 1] : 0) + 1 : 0
    push('runs', 'right[i][j] =', `Row ${i} is finished. Each one adds one to the run that starts in the next cell.`)
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = 0; j < m; j++) down[i][j] = grid[i][j] ? (i + 1 < n ? down[i + 1][j] : 0) + 1 : 0
    push('runs', 'down[i][j] =', `Row ${i}, scanned from the bottom: each one extends the column run that starts in the row below.`)
  }

  let best = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (!grid[i][j]) continue
      const limit = Math.min(right[i][j], down[i][j])
      push('corners', 'for each top-left cell', `Top-left corner (row ${i}, column ${j}) holds a one. Its top and left edges allow a side up to ${limit}.`, { corner: [i, j] })
      for (let size = limit; size > best; size--) {
        const bottomOk = right[i + size - 1][j] >= size
        const rightOk = down[i][j + size - 1] >= size
        push('check', 'for size from', `Test side ${size}. The bottom edge run is ${right[i + size - 1][j]} and the right edge run is ${down[i][j + size - 1]}; each must reach ${size}.`, { corner: [i, j], size })
        if (bottomOk && rightOk) {
          best = size
          push('corners', 'best = size', `Side ${size} works, so the best square now has area ${best * best}.`, { corner: [i, j], size, best })
          break
        }
      }
    }
  }

  const result = best * best
  push('done', 'return best * best', `The largest square with an all-ones border has side ${best}, so its area is ${result}.`, { best })
  return { input: grid, result, frames }
}
