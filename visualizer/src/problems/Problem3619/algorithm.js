export function parseInput(text) {
  const input = JSON.parse(text)
  const { grid, k } = input ?? {}
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 8 || !Array.isArray(grid[0])) throw new Error('grid is a table of 1 to 8 rows.')
  const cols = grid[0].length
  if (cols < 1 || cols > 8) throw new Error('Each row has 1 to 8 cells.')
  if (grid.some(row => !Array.isArray(row) || row.length !== cols || row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) throw new Error('Every cell is an integer from 0 to 9; 0 is land.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { grid, k }
}

export function buildTrace(input) {
  const { grid, k } = input
  const rows = grid.length
  const cols = grid[0].length
  const seen = grid.map(row => row.map(() => false))
  const frames = [{ phase: 'start', activeLine: L('set count to zero'), current: null, total: 0, visited: [], count: 0, message: 'Scan the grid in row order. Each unseen non-zero cell starts a new island.' }]
  const visited = []
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0 || seen[r][c]) continue
      let total = 0
      const cells = []
      const stack = [[r, c]]
      seen[r][c] = true
      while (stack.length > 0) {
        const [y, x] = stack.pop()
        total += grid[y][x]
        cells.push([y, x])
        frames.push({ phase: 'flood', activeLine: L('pop a cell'), current: [y, x], total, visited: [...visited, ...cells], count, message: `Add ${grid[y][x]} from cell (${y}, ${x}). Island total so far: ${total}.` })
        for (const [ny, nx] of [[y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]]) {
          if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && grid[ny][nx] !== 0 && !seen[ny][nx]) {
            seen[ny][nx] = true
            stack.push([ny, nx])
          }
        }
      }
      const ok = total % k === 0
      if (ok) count++
      visited.push(...cells)
      frames.push({ phase: ok ? 'count' : 'reject', activeLine: L('if total is divisible'), current: null, total, visited: [...visited], count, message: ok ? `Island total ${total} is divisible by ${k}. Count: ${count}.` : `Island total ${total} is not divisible by ${k}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), current: null, total: 0, visited: [...visited], count, message: `Islands whose total is divisible by ${k}: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count islands whose total value is divisible by k
  set count to zero and mark every cell as unseen
  for each cell (row, column) in row order
    if the cell is land or already seen then skip it
    set total to zero and push the cell onto a stack, marking it seen
    repeat while the stack is not empty
      pop a cell and add its value to total
      push each unseen water neighbour up, down, left and right, marking it seen
    if total is divisible by k then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_islands(grid, k):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 0 or seen[r][c]:
                continue
            total = 0
            stack = [(r, c)]
            seen[r][c] = True
            while stack:
                y, x = stack.pop()
                total += grid[y][x]
                for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= ny < rows and 0 <= nx < cols and grid[ny][nx] != 0 and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((ny, nx))
            if total % k == 0:
                count += 1
    return count
`
