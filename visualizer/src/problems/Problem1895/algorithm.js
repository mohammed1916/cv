const ERROR = 'Enter {"grid":[[...],...]} with 1 to 5 rows and 1 to 5 columns of integers from 0 to 9.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.grid)) throw new Error(ERROR)
  const { grid } = value
  if (grid.length < 1 || grid.length > 5 || !Array.isArray(grid[0])) throw new Error(ERROR)
  const cols = grid[0].length
  if (cols < 1 || cols > 5) throw new Error(ERROR)
  if (!grid.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error(ERROR)
  return { grid }
}

export const code = `find the side of the largest magic square
rows = number of rows, cols = number of columns
for side from the smaller of rows and cols down to 2
  for each top-left corner (top, left) of a side by side square
    collect every row sum, column sum and the two diagonal sums
    if they are all equal then return side
return 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ grid }) {
  const rows = grid.length, cols = grid[0].length
  const frames = [{ phase: 'start', activeLine: L('find the side'), side: 0, top: -1, left: -1, sums: [], ok: null, message: 'Try the largest possible squares first. A 1 by 1 square is always magic, so the answer is at least 1.' }]
  for (let side = Math.min(rows, cols); side >= 2; side--) {
    frames.push({ phase: 'size', activeLine: L('for side from'), side, top: -1, left: -1, sums: [], ok: null, message: `Check every ${side} by ${side} square.` })
    for (let top = 0; top <= rows - side; top++) {
      for (let left = 0; left <= cols - side; left++) {
        const sums = []
        for (let i = 0; i < side; i++) { let s = 0; for (let j = 0; j < side; j++) s += grid[top + i][left + j]; sums.push(s) }
        for (let j = 0; j < side; j++) { let s = 0; for (let i = 0; i < side; i++) s += grid[top + i][left + j]; sums.push(s) }
        let d1 = 0, d2 = 0
        for (let i = 0; i < side; i++) { d1 += grid[top + i][left + i]; d2 += grid[top + i][left + side - 1 - i] }
        sums.push(d1, d2)
        const ok = sums.every(s => s === sums[0])
        frames.push({ phase: 'check', activeLine: L('collect every row sum'), side, top, left, sums, ok, message: ok ? `The ${side} by ${side} square at (${top}, ${left}) is magic: every line sums to ${sums[0]}.` : `The square at (${top}, ${left}) is not magic: its line sums are ${sums.join(', ')}.` })
        if (ok) {
          frames.push({ phase: 'done', activeLine: L('if they are all equal then return side'), side, top, left, sums, ok, message: `Largest magic square: ${side} by ${side}.` })
          return { input: { grid }, result: side, frames }
        }
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return 1'), side: 1, top: -1, left: -1, sums: [], ok: null, message: 'No square larger than 1 by 1 is magic, so the answer is 1.' })
  return { input: { grid }, result: 1, frames }
}

export const python = `def largest_magic_square(grid):
    rows = len(grid)
    cols = len(grid[0])
    for side in range(min(rows, cols), 1, -1):
        for top in range(rows - side + 1):
            for left in range(cols - side + 1):
                sums = []
                for i in range(side):
                    sums.append(sum(grid[top + i][left:left + side]))
                for j in range(side):
                    sums.append(sum(grid[top + i][left + j] for i in range(side)))
                sums.append(sum(grid[top + i][left + i] for i in range(side)))
                sums.append(sum(grid[top + i][left + side - 1 - i] for i in range(side)))
                if all(s == sums[0] for s in sums):
                    return side
    return 1
`
