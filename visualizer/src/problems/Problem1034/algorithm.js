export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.grid)) throw new Error('Use an object with a grid array of rows.')
  const { grid, row, col, color } = obj
  if (grid.length < 1 || grid.length > 6 || !Array.isArray(grid[0])) throw new Error('grid has 1 to 6 rows.')
  const cols = grid[0].length
  if (cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 values.')
  if (grid.some(r => !Array.isArray(r) || r.length !== cols || r.some(v => !Number.isInteger(v) || v < 0 || v > 3))) throw new Error('Grid values are integers from 0 to 3 with equal row lengths.')
  if (!Number.isInteger(row) || row < 0 || row >= grid.length || !Number.isInteger(col) || col < 0 || col >= cols) throw new Error('row and col must point inside the grid.')
  if (!Number.isInteger(color) || color < 0 || color > 5) throw new Error('color is an integer from 0 to 5.')
  return { grid, row, col, color }
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

export function buildTrace(input) {
  const { grid, row, col, color } = input
  const R = grid.length
  const C = grid[0].length
  const original = grid[row][col]
  const inside = Array.from({ length: R }, () => new Array(C).fill(false))
  const members = []
  const frames = [{ phase: 'start', activeLine: L('set original to the value'), cell: null, members: [], borders: [], message: `The starting cell holds ${original}.` }]
  inside[row][col] = true
  const stack = [[row, col]]
  while (stack.length) {
    const [r, c] = stack.pop()
    members.push([r, c])
    frames.push({ phase: 'flood', activeLine: L('take a cell'), cell: [r, c], members: members.map(m => [...m]), borders: [], message: `Visit (${r}, ${c}) in the component.` })
    for (const [dr, dc] of DIRS) {
      const nr = r + dr
      const nc = c + dc
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !inside[nr][nc] && grid[nr][nc] === original) {
        inside[nr][nc] = true
        stack.push([nr, nc])
      }
    }
  }
  const out = grid.map(line => [...line])
  const borders = []
  for (const [r, c] of members) {
    const onBorder = DIRS.some(([dr, dc]) => {
      const nr = r + dr
      const nc = c + dc
      return nr < 0 || nr >= R || nc < 0 || nc >= C || !inside[nr][nc]
    })
    if (onBorder) {
      out[r][c] = color
      borders.push([r, c])
      frames.push({ phase: 'border', activeLine: L('recolor the cell'), cell: [r, c], members: members.map(m => [...m]), borders: borders.map(b => [...b]), message: `(${r}, ${c}) touches the edge or another value, so it becomes ${color}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the grid'), cell: null, members: members.map(m => [...m]), borders: borders.map(b => [...b]), message: `${borders.length} border cells recolored.` })
  return { input, result: out, frames }
}

export const code = `color the border of the connected component at (row, col)
  set original to the value at (row, col)
  set stack to contain (row, col) and mark it as in the component
  while the stack is not empty do
    take a cell from the stack and add it to the component
    for each of its four neighbours with the value original that is not yet marked do
      mark the neighbour and push it onto the stack
  for each cell of the component do
    if some neighbour is outside the grid or not in the component then
      recolor the cell with color
  return the grid`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def color_border(grid, row, col, color):
    rows = len(grid)
    cols = len(grid[0])
    original = grid[row][col]
    members = {(row, col)}
    stack = [(row, col)]
    while stack:
        r, c = stack.pop()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in members and grid[nr][nc] == original:
                members.add((nr, nc))
                stack.append((nr, nc))
    result = [line[:] for line in grid]
    for r, c in members:
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if not (0 <= nr < rows and 0 <= nc < cols) or (nr, nc) not in members:
                result[r][c] = color
                break
    return result
`
