const L = s => {
  const line = code.findIndex(c => c.text.includes(s)) + 1
  if (line < 1) throw new Error(`Missing pseudocode line: ${s}`)
  return line
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 4) throw new Error('grid has 1 to 4 rows.')
  const width = Array.isArray(grid[0]) ? grid[0].length : 0
  if (width < 1 || width > 4) throw new Error('grid has 1 to 4 columns.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== width || !row.every(v => v === 0 || v === 1)) throw new Error('Every row has the same width and holds only 0 or 1.')
  }
  return { grid }
}

// A state is the set of cleared rows and cleared columns (bitmasks).
// A cell is still 1 when it started as 1 and neither its row nor its column is cleared.
function onesIn(grid, rowMask, colMask) {
  const cells = []
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (v === 1 && !((rowMask >> r) & 1) && !((colMask >> c) & 1)) cells.push([r, c])
  }))
  return cells
}

export function buildTrace({ grid }) {
  const frames = []
  const queue = [{ rowMask: 0, colMask: 0, ops: 0 }]
  const seen = new Set(['0,0'])
  let head = 0
  let result = null
  frames.push({ pythonLine: 5, phase: 'start', activeLine: L('start with the grid'), rowMask: 0, colMask: 0, ops: 0, ones: onesIn(grid, 0, 0), chosen: null, queued: 1, level: 0, message: `Start with the full grid: ${onesIn(grid, 0, 0).length} ones and no operations used.` })
  while (head < queue.length && result === null) {
    const { rowMask, colMask, ops } = queue[head++]
    const ones = onesIn(grid, rowMask, colMask)
    if (ones.length === 0) {
      result = ops
      frames.push({ pythonLine: 12, phase: 'done', activeLine: L('return the operation count'), rowMask, colMask, ops, ones, chosen: null, queued: queue.length - head, level: ops, message: `No ones are left after ${ops} operation${ops === 1 ? '' : 's'}. That is the minimum, because the queue explores by operation count.` })
      break
    }
    frames.push({ pythonLine: 8, phase: 'expand', activeLine: L('take the oldest state'), rowMask, colMask, ops, ones, chosen: null, queued: queue.length - head, level: ops, message: `Expand a state with ${ops} operation${ops === 1 ? '' : 's'} and ${ones.length} one${ones.length === 1 ? '' : 's'} left.` })
    for (const [r, c] of ones) {
      const nextRow = rowMask | (1 << r)
      const nextCol = colMask | (1 << c)
      const key = `${nextRow},${nextCol}`
      if (seen.has(key)) {
        frames.push({ pythonLine: 15, phase: 'seen', activeLine: L('if the next state is not seen'), rowMask, colMask, ops, ones, chosen: [r, c], queued: queue.length - head, level: ops, message: `Clearing row ${r} and column ${c} reaches a state already queued.` })
        continue
      }
      seen.add(key)
      queue.push({ rowMask: nextRow, colMask: nextCol, ops: ops + 1 })
      frames.push({ pythonLine: 17, phase: 'queue', activeLine: L('mark it and add it'), rowMask, colMask, ops, ones, chosen: [r, c], queued: queue.length - head, level: ops + 1, message: `Clear row ${r} and column ${c}: a new state at ${ops + 1} operation${ops + 1 === 1 ? '' : 's'}.` })
    }
  }
  if (result === null) result = 0
  return { input: { grid }, result, frames }
}

export const code = `minimum operations to clear every one in the grid
start with the grid, the cleared rows and columns empty, and 0 operations
create a queue holding that state, and mark it as seen
while the queue is not empty
  take the oldest state with its operation count
  if no cell is still 1 in that state then return the operation count
  for each cell (r, c) that is still 1
    clear row r and column c to get the next state
    if the next state is not seen then mark it and add it with one more operation
return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def min_clear_operations(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque([(0, 0, 0)])
    seen = {(0, 0)}
    while queue:
        row_mask, col_mask, ops = queue.popleft()
        cells = [(r, c) for r in range(rows) for c in range(cols)
                 if grid[r][c] == 1 and not (row_mask >> r) & 1 and not (col_mask >> c) & 1]
        if not cells:
            return ops
        for r, c in cells:
            state = (row_mask | (1 << r), col_mask | (1 << c))
            if state not in seen:
                seen.add(state)
                queue.append((state[0], state[1], ops + 1))
    return 0
`
