// LeetCode 2852: Sum of Remoteness of All Cells (draft rules).
// Grid cells hold nonnegative values; -1 marks a blocked cell. Moves are four-directional through unblocked cells.
// A cell's remoteness is the total value of unblocked cells it cannot reach. Cells in one component share that number,
// so each component contributes (cells in it) * (total value outside it).

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function parseInput(text) {
  const grid = JSON.parse(text)
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('Use a list of 1 to 6 rows.')
  const width = grid[0]?.length
  if (!grid.every(row => Array.isArray(row) && row.length === width && width >= 1 && width <= 6)) {
    throw new Error('Every row needs the same width of 1 to 6 values.')
  }
  if (!grid.flat().every(v => Number.isInteger(v) && (v === -1 || (v >= 0 && v <= 9)))) {
    throw new Error('Each cell is -1 (blocked) or an integer from 0 to 9.')
  }
  return grid
}

const CODE_TEXT = [
  'sum of remoteness over all unblocked cells',
  '  total ← sum of all values that are not -1',
  '  component ← array of -1 per cell; answer ← 0',
  '  FOR each unblocked cell (r, c) without a component',
  '    flood-fill from (r, c) through unblocked neighbours; label each cell with a new id',
  '    cells ← number of cells in this component; sum ← their values total',
  '    answer ← answer + cells * (total - sum)',
  '  return answer',
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

const PYTHON_TEXT = `def sum_of_remoteness(grid):
    rows, cols = len(grid), len(grid[0])
    total = sum(v for row in grid for v in row if v != -1)
    label = [[-1] * cols for _ in range(rows)]
    answer = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == -1 or label[r][c] != -1:
                continue
            cells, value_sum = 0, 0
            stack = [(r, c)]
            label[r][c] = r * cols + c
            while stack:
                x, y = stack.pop()
                cells += 1
                value_sum += grid[x][y]
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < rows and 0 <= ny < cols and grid[nx][ny] != -1 and label[nx][ny] == -1:
                        label[nx][ny] = r * cols + c
                        stack.append((nx, ny))
            answer += cells * (total - value_sum)
    return answer
`

export const python = PYTHON_TEXT

const P = s => {
  const index = PYTHON_TEXT.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'total', label: 'Total', description: 'Add every unblocked value.' },
  { id: 'fill', label: 'Flood', description: 'Grow one component from a new cell.' },
  { id: 'add', label: 'Component', description: 'Add its share of remoteness.' },
  { id: 'done', label: 'Result', description: 'Report the sum.' },
]

export function buildTrace(grid) {
  const rows = grid.length, cols = grid[0].length
  const total = grid.flat().filter(v => v !== -1).reduce((a, b) => a + b, 0)
  const label = grid.map(row => row.map(() => -1))
  const frames = []
  let answer = 0
  let componentCount = 0
  const snap = extra => ({ total, label: label.map(row => [...row]), answer, ...extra })
  frames.push(snap({ phase: 'total', activeLine: L('total ← sum'), pythonLine: P('total = sum('), cell: null, cells: 0, sum: 0, message: `Total of all unblocked values is ${total}.` }))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === -1 || label[r][c] !== -1) continue
      const id = componentCount++
      let cells = 0, sum = 0
      const stack = [[r, c]]
      label[r][c] = id
      while (stack.length) {
        const [x, y] = stack.pop()
        cells++
        sum += grid[x][y]
        frames.push(snap({ phase: 'fill', activeLine: L('flood-fill from'), pythonLine: P('value_sum += grid[x][y]'), cell: [x, y], cells, sum, componentId: id, message: `Cell (${x}, ${y}) joins component ${id}.` }))
        for (const [dr, dc] of DIRS) {
          const nx = x + dr, ny = y + dc
          if (nx < 0 || ny < 0 || nx >= rows || ny >= cols || grid[nx][ny] === -1 || label[nx][ny] !== -1) continue
          label[nx][ny] = id
          stack.push([nx, ny])
        }
      }
      answer += cells * (total - sum)
      frames.push(snap({ phase: 'add', activeLine: L('answer ← answer + cells'), pythonLine: P('answer += cells'), cell: [r, c], cells, sum, componentId: id, message: `Component ${id}: ${cells} cell${cells === 1 ? '' : 's'}, value ${sum}; adds ${cells} × ${total - sum}.` }))
    }
  }
  frames.push(snap({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), cell: null, cells: 0, sum: 0, message: `Sum of remoteness is ${answer}.` }))
  return { input: grid, result: answer, frames }
}
