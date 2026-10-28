export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.grid) || input.grid.length < 3 || input.grid.length > 6) throw new Error('Use {"grid": [...]} with a square matrix of size 3 to 6.')
  const n = input.grid.length
  if (input.grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('The grid must be square.')
  if (input.grid.flat().some(v => !Number.isInteger(v) || v < 0 || v > 9)) throw new Error('Cell values are integers from 0 to 9.')
  return { grid: input.grid }
}

export function buildTrace({ grid }) {
  const n = grid.length
  let ok = true
  const frames = [{ phase: 'start', activeLine: L('set ok to yes'), row: null, col: null, message: 'Assume the matrix is an X-matrix until a cell disagrees.' }]
  for (let i = 0; i < n && ok; i++) {
    for (let j = 0; j < n; j++) {
      const diagonal = i === j || i + j === n - 1
      const good = diagonal ? grid[i][j] !== 0 : grid[i][j] === 0
      frames.push({ phase: good ? 'check' : 'fail', activeLine: L(good ? 'if j is on a diagonal' : 'if the rule breaks'), row: i, col: j, message: `Cell ${grid[i][j]} at row ${i}, column ${j} ${diagonal ? 'is on a diagonal and must be nonzero' : 'is off the diagonals and must be zero'}${good ? '.' : ', so this is not an X-matrix.'}` })
      if (!good) {
        ok = false
        break
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ok'), row: null, col: null, message: ok ? 'Every diagonal cell is nonzero and every other cell is zero.' : 'Not an X-matrix.' })
  return { input: { grid }, result: ok, frames }
}

export const code = `check whether a square matrix is an X-matrix
  set ok to yes
  for each row i
    for each column j
      if j is on a diagonal of the row then
        the cell must be nonzero
      otherwise
        the cell must be zero
      if the rule breaks then
        set ok to no and stop
  return ok`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def is_x_matrix(grid):
    n = len(grid)
    for i in range(n):
        for j in range(n):
            on_diagonal = i == j or i + j == n - 1
            if on_diagonal != (grid[i][j] != 0):
                return False
    return True
`
