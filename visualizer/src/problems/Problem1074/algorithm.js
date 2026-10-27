const ERROR = 'Enter {"matrix":[[...],...],"target":t} with 1 to 6 rows and 1 to 6 columns of integers from -9 to 9, and a target from -20 to 20.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.matrix) || !Number.isInteger(value.target)) throw new Error(ERROR)
  const { matrix, target } = value
  if (matrix.length < 1 || matrix.length > 6 || !Array.isArray(matrix[0])) throw new Error(ERROR)
  const cols = matrix[0].length
  if (cols < 1 || cols > 6) throw new Error(ERROR)
  const cellsOk = matrix.every(row => Array.isArray(row) && row.length === cols && row.every(v => Number.isInteger(v) && v >= -9 && v <= 9))
  if (!cellsOk || target < -20 || target > 20) throw new Error(ERROR)
  return { matrix, target }
}

export const code = `count submatrices whose sum equals target
set count to 0
for each top row
  set every column sum to 0
  for each bottom row from top to the last row
    add that bottom row into the column sums
    found = number of subarrays of the column sums that add to target
    add found to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ matrix, target }) {
  const rows = matrix.length, cols = matrix[0].length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), top: -1, bottom: -1, columnSums: [], found: 0, count, message: `Find submatrices whose sum is ${target}. Fix a pair of rows; the columns between them become one array of column sums.` }]
  for (let top = 0; top < rows; top++) {
    const columnSums = new Array(cols).fill(0)
    for (let bottom = top; bottom < rows; bottom++) {
      for (let c = 0; c < cols; c++) columnSums[c] += matrix[bottom][c]
      let found = 0
      const seen = new Map([[0, 1]])
      let running = 0
      for (const value of columnSums) {
        running += value
        found += seen.get(running - target) ?? 0
        seen.set(running, (seen.get(running) ?? 0) + 1)
      }
      count += found
      frames.push({ phase: 'band', activeLine: L('found = number of subarrays'), top, bottom, columnSums: [...columnSums], found, count, message: `Rows ${top} to ${bottom} give column sums [${columnSums.join(', ')}]. ${found} subarray(s) add to ${target}, so the count is now ${count}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), top: -1, bottom: -1, columnSums: [], found: 0, count, message: `Total submatrices with sum ${target}: ${count}.` })
  return { input: { matrix, target }, result: count, frames }
}

export const python = `def num_submatrix_sum_target(matrix, target):
    rows = len(matrix)
    cols = len(matrix[0])
    count = 0
    for top in range(rows):
        column_sums = [0] * cols
        for bottom in range(top, rows):
            for c in range(cols):
                column_sums[c] += matrix[bottom][c]
            seen = {0: 1}
            running = 0
            for value in column_sums:
                running += value
                count += seen.get(running - target, 0)
                seen[running] = seen.get(running, 0) + 1
    return count
`
