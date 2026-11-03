export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a grid of 0s and 1s.')
  const { grid } = input
  if (!Array.isArray(grid) || grid.length < 1 || grid.length > 6) throw new Error('grid has 1 to 6 rows.')
  const cols = grid[0].length
  if (!Array.isArray(grid[0]) || cols < 1 || cols > 6) throw new Error('Each row has 1 to 6 cells.')
  for (const row of grid) {
    if (!Array.isArray(row) || row.length !== cols || !row.every(v => v === 0 || v === 1)) throw new Error('Every row must have the same length and hold only 0 or 1.')
  }
  return { grid }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ grid }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const rows = grid.length
  const cols = grid[0].length
  const allOnes = (r, c, s) => {
    for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) if (grid[r + i][c + j] !== 1) return false
    return true
  }
  frames.push({ phase: 'start', activeLine: L('for side from the largest'), pythonLine: P('rows, cols'), side: null, squares: [], pair: null, disjoint: null, result: null, message: 'Try the largest side first and go down one step at a time.' })

  for (let side = Math.min(rows, cols); side >= 1; side--) {
    const squares = []
    for (let r = 0; r + side <= rows; r++) {
      for (let c = 0; c + side <= cols; c++) if (allOnes(r, c, side)) squares.push([r, c])
    }
    frames.push({ phase: 'side', activeLine: L('squares = top-left corners'), pythonLine: P('squares = [(r, c)'), side, squares, pair: null, disjoint: null, result: null, message: `Side ${side}: ${squares.length} all-one square${squares.length === 1 ? '' : 's'}.` })
    let found = null
    for (let x = 0; x < squares.length && !found; x++) {
      for (let y = x + 1; y < squares.length && !found; y++) {
        const [r1, c1] = squares[x]
        const [r2, c2] = squares[y]
        const disjoint = Math.abs(r1 - r2) >= side || Math.abs(c1 - c2) >= side
        frames.push({ phase: 'pair', activeLine: L('if the two squares do not share'), pythonLine: P('if abs(r1 - r2) >= side'), side, squares, pair: [squares[x], squares[y]], disjoint, result: null, message: `Squares at (${r1},${c1}) and (${r2},${c2}) ${disjoint ? 'do not share a cell' : 'overlap'}.` })
        if (disjoint) found = [squares[x], squares[y]]
      }
    }
    if (found) {
      frames.push({ phase: 'found', activeLine: L('return side times side'), pythonLine: P('return side * side'), side, squares, pair: found, disjoint: true, result: side * side, message: `Two disjoint squares of side ${side} fit, so the area is ${side * side}.` })
      return { input: { grid }, result: side * side, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return 0'), pythonLine: P('return 0'), side: null, squares: [], pair: null, disjoint: null, result: 0, message: 'No two disjoint all-one squares exist, so the answer is 0.' })
  return { input: { grid }, result: 0, frames }
}

export const code = `largest area of two cell-disjoint all-one squares of equal side
for side from the largest possible down to 1
  squares = top-left corners where an all-one square of this side fits
  for each pair of squares
    if the two squares do not share a cell then return side times side
return 0`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_area_two_squares(grid):
    rows, cols = len(grid), len(grid[0])
    def all_ones(r, c, s):
        return all(grid[r + i][c + j] == 1 for i in range(s) for j in range(s))
    for side in range(min(rows, cols), 0, -1):
        squares = [(r, c) for r in range(rows - side + 1) for c in range(cols - side + 1) if all_ones(r, c, side)]
        for x in range(len(squares)):
            for y in range(x + 1, len(squares)):
                (r1, c1), (r2, c2) = squares[x], squares[y]
                if abs(r1 - r2) >= side or abs(c1 - c2) >= side:
                    return side * side
    return 0
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
