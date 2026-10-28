export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.grid) || input.grid.length < 1 || input.grid.length > 6) throw new Error('Use {"grid": [...]} with a square matrix of size 1 to 6.')
  const n = input.grid.length
  if (input.grid.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('The grid must be square.')
  if (input.grid.flat().some(v => !Number.isInteger(v) || v < 0 || v > 20)) throw new Error('Cell values are integers from 0 to 20.')
  return { grid: input.grid }
}

const copy = matrix => matrix.map(row => [...row])

export function buildTrace({ grid }) {
  const n = grid.length
  const matrix = copy(grid)
  const frames = [{ phase: 'start', activeLine: L('for each diagonal from bottom-left'), diagonal: null, cells: [], matrix: copy(matrix), message: 'Each diagonal is sorted on its own.' }]
  for (let d = -(n - 1); d <= n - 1; d++) {
    // d = row minus column; d >= 0 is on or below the main diagonal.
    const cells = []
    for (let r = 0; r < n; r++) {
      const c = r - d
      if (c >= 0 && c < n) cells.push([r, c])
    }
    const values = cells.map(([r, c]) => matrix[r][c])
    values.sort((a, b) => (d >= 0 ? b - a : a - b))
    cells.forEach(([r, c], i) => { matrix[r][c] = values[i] })
    frames.push({ phase: 'diagonal', activeLine: L(d >= 0 ? 'sort non-increasing' : 'sort non-decreasing'), diagonal: d, cells, matrix: copy(matrix), message: `Diagonal ${d} is sorted ${d >= 0 ? 'non-increasing' : 'non-decreasing'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the matrix'), diagonal: null, cells: [], matrix: copy(matrix), message: 'Every diagonal is sorted.' })
  return { input: { grid }, result: matrix, frames }
}

export const code = `sort each diagonal of a square matrix
  for each diagonal from bottom-left corner to top-right corner
    collect the values on that diagonal from top-left to bottom-right
    if the diagonal starts on the left edge or the main diagonal then
      sort non-increasing
    otherwise
      sort non-decreasing
    write the sorted values back along the diagonal
  return the matrix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sort_matrix_by_diagonals(grid):
    n = len(grid)
    matrix = [row[:] for row in grid]
    for d in range(-(n - 1), n):
        cells = [(r, r - d) for r in range(n) if 0 <= r - d < n]
        values = sorted((matrix[r][c] for r, c in cells), reverse=(d >= 0))
        for (r, c), value in zip(cells, values):
            matrix[r][c] = value
    return matrix
`
