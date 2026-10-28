export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.matrix)) throw new Error('Use {"matrix": [[...]]} with non-negative integers.')
  const { matrix } = data
  const n = matrix.length
  if (n < 1 || n > 7) throw new Error('The matrix must have 1 to 7 rows for the visualization.')
  if (matrix.some(row => !Array.isArray(row) || row.length !== matrix[0].length || row.length < 1 || row.length > 7)) throw new Error('Every row must have the same length, 1 to 7 columns.')
  if (matrix.some(row => row.some(v => !Number.isInteger(v) || v < 0 || v > 6))) throw new Error('Values are integers from 0 to 6.')
  return { matrix }
}

export function buildTrace(input) {
  const { matrix } = input
  const n = matrix.length
  const m = matrix[0].length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('let count be 0'), cell: null, value: null, count, message: 'Each non-zero cell is tested with its own value as the radius.' }]
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < m; c++) {
      const x = matrix[r][c]
      if (x === 0) continue
      let beaten = null
      for (let i = Math.max(0, r - x); i <= Math.min(n - 1, r + x); i++) {
        for (let j = Math.max(0, c - x); j <= Math.min(m - 1, c + x); j++) {
          if (Math.abs(i - r) === x && Math.abs(j - c) === x) continue
          if (beaten === null && matrix[i][j] > x) beaten = [i, j]
        }
      }
      if (beaten === null) count++
      frames.push({ phase: beaten === null ? 'local' : 'beaten', activeLine: L('if ok is true'), cell: [r, c], value: x, count, beaten, message: beaten === null ? `Cell (${r}, ${c}) with value ${x} sees nothing larger, so it is a local maximum.` : `Cell (${r}, ${c}) with value ${x} sees a larger value at (${beaten[0]}, ${beaten[1]}).` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), cell: null, value: null, count, message: `Local maximums: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count the local maximum cells in the matrix
  let count be 0
  for each row r and column c
    let x be matrix[r][c]
    if x is zero then skip this cell
    let ok be true
    for each cell (i, j) within x rows and x columns of (r, c)
      if both distances from (r, c) are exactly x then skip this cell
      if matrix[i][j] is greater than x then set ok to false
    if ok is true then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_local_maximums(matrix):
    n = len(matrix)
    m = len(matrix[0])
    count = 0
    for r in range(n):
        for c in range(m):
            x = matrix[r][c]
            if x == 0:
                continue
            ok = True
            for i in range(max(0, r - x), min(n - 1, r + x) + 1):
                for j in range(max(0, c - x), min(m - 1, c + x) + 1):
                    if abs(i - r) == x and abs(j - c) == x:
                        continue
                    if matrix[i][j] > x:
                        ok = False
            if ok:
                count += 1
    return count
`
