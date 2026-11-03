export const code = `set every cell to an obstacle
paint the top row free
paint the right column free
count right and down paths from the top-left cell
  if the cell is an obstacle, its count is zero
  otherwise add the counts from above and from the left
return the grid as strings`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def create_grid(rows, cols):
    grid = [['#'] * cols for _ in range(rows)]
    for c in range(cols):
        grid[0][c] = '.'
    for r in range(rows):
        grid[r][cols - 1] = '.'
    ways = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '#':
                continue
            if r == 0 and c == 0:
                ways[r][c] = 1
            else:
                ways[r][c] = (ways[r - 1][c] if r > 0 else 0) + (ways[r][c - 1] if c > 0 else 0)
    return [''.join(row) for row in grid]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with rows and cols.')
  const { rows, cols } = input
  if (!Number.isInteger(rows) || rows < 1 || rows > 25) throw new Error('rows is an integer from 1 to 25.')
  if (!Number.isInteger(cols) || cols < 1 || cols > 25) throw new Error('cols is an integer from 1 to 25.')
  return { rows, cols }
}

export function buildTrace({ rows, cols }) {
  const frames = []
  const grid = Array.from({ length: rows }, () => Array(cols).fill('#'))
  const ways = Array.from({ length: rows }, () => Array(cols).fill(null))
  const snap = () => grid.map(row => row.join(''))
  const push = (phase, codeText, pyText, cell, message) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), cell, grid: snap(), ways: ways.map(row => [...row]), message,
  })
  push('start', 'set every cell to an obstacle', 'grid = [', null, `A ${rows} by ${cols} grid starts full of obstacles.`)
  for (let c = 0; c < cols; c++) {
    grid[0][c] = '.'
    push('top', 'paint the top row free', "grid[0][c] = '.'", [0, c], `Cell (0, ${c}) is free.`)
  }
  for (let r = 0; r < rows; r++) {
    grid[r][cols - 1] = '.'
    push('right', 'paint the right column free', 'grid[r][cols - 1]', [r, cols - 1], `Cell (${r}, ${cols - 1}) is free.`)
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '#') {
        ways[r][c] = 0
        push('count', 'if the cell is an obstacle', "if grid[r][c] == '#'", [r, c], `Cell (${r}, ${c}) is an obstacle and has no paths.`)
        continue
      }
      if (r === 0 && c === 0) ways[r][c] = 1
      else ways[r][c] = (r > 0 ? ways[r - 1][c] : 0) + (c > 0 ? ways[r][c - 1] : 0)
      push('count', 'count right and down paths', 'ways[r][c] =', [r, c], `Paths into (${r}, ${c}): ${ways[r][c]}.`)
    }
  }
  const finalWays = ways[rows - 1][cols - 1]
  push('done', 'return the grid as strings', "return [''.join", [rows - 1, cols - 1], `The bottom-right cell has ${finalWays} path${finalWays === 1 ? '' : 's'}, so the grid is valid.`)
  return { input: { rows, cols }, result: snap(), frames }
}
