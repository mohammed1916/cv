export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a matrix array.')
  const { matrix } = input
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 6 || !Array.isArray(matrix[0]) || matrix[0].length < 1 || matrix[0].length > 6) throw new Error('matrix must be at most 6 by 6.')
  const n = matrix[0].length
  if (matrix.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < -1 || v > 50))) throw new Error('matrix must be rectangular, with integers from -1 to 50.')
  for (let c = 0; c < n; c++) {
    if (matrix.every(row => row[c] === -1)) throw new Error('every column needs at least one value that is not -1.')
  }
  return { matrix }
}

export function buildTrace(input) {
  const { matrix } = input
  const rows = matrix.length
  const cols = matrix[0].length
  const result = matrix.map(row => [...row])
  const colMax = []
  const frames = [{ phase: 'start', activeLine: L('set colMax'), matrix: result.map(r => [...r]), active: null, message: 'Each -1 becomes the largest value in its column.' }]
  for (let c = 0; c < cols; c++) {
    let best = -1
    for (let r = 0; r < rows; r++) if (matrix[r][c] !== -1) best = Math.max(best, matrix[r][c])
    colMax[c] = best
    frames.push({ phase: 'column', activeLine: L('find the largest value in the column'), matrix: result.map(r => [...r]), active: { row: -1, col: c }, message: `Column ${c} has largest non -1 value ${best}.` })
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (result[r][c] === -1) {
        result[r][c] = colMax[c]
        frames.push({ phase: 'replace', activeLine: L('replace it with'), matrix: result.map(row => [...row]), active: { row: r, col: c }, message: `Replace the -1 at (${r}, ${c}) with ${colMax[c]}.` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return matrix'), matrix: result.map(r => [...r]), active: null, message: 'No -1 remains.' })
  return { input, result, frames }
}

export const code = `modify the matrix (matrix):
  set colMax to an empty list
  for each column
    find the largest value in the column that is not -1
    store it in colMax for this column
  for each row
    for each column
      if the cell is -1 then
        replace it with the column maximum from colMax
  return matrix`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def modify_matrix(matrix):
    rows, cols = len(matrix), len(matrix[0])
    col_max = []
    for c in range(cols):
        col_max.append(max(matrix[r][c] for r in range(rows) if matrix[r][c] != -1))
    result = [row[:] for row in matrix]
    for r in range(rows):
        for c in range(cols):
            if result[r][c] == -1:
                result[r][c] = col_max[c]
    return result
`
