export const phases = [
  { id: 'start', label: 'Empty table', description: 'Create a table of the same size as the matrix, with every entry starting at zero.' },
  { id: 'cell', label: 'Read cell', description: 'Look at the next cell. A zero cell can end no square; a one cell depends on its neighbours above, left and diagonally above-left.' },
  { id: 'extend', label: 'Size of largest square', description: 'For a one cell, the largest all-ones square ending there is one more than the smallest of those three neighbours.' },
  { id: 'add', label: 'Add to total', description: 'Every square counted by a cell ends there, so its table entry is added to the running total.' },
  { id: 'done', label: 'Complete', description: 'Return the total number of all-ones square submatrices.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"matrix": [[1, 0], [1, 1]]}.')
  const { matrix } = input
  if (!Array.isArray(matrix) || matrix.length < 1 || matrix.length > 8) throw new Error('matrix has 1 to 8 rows.')
  const width = Array.isArray(matrix[0]) ? matrix[0].length : 0
  if (width < 1 || width > 8) throw new Error('Each row has 1 to 8 columns.')
  if (!matrix.every(row => Array.isArray(row) && row.length === width && row.every(v => v === 0 || v === 1))) throw new Error('Every row must have the same length and contain only 0 or 1.')
  return { matrix }
}

export function buildTrace({ matrix }) {
  const rows = matrix.length
  const cols = matrix[0].length
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0))
  const snap = (i, j, extra) => ({ dp: dp.map(r => [...r]), i, j, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const dp = Array'), pythonLine: P('dp = '), snapshot: snap(null, null, {}), message: `A ${rows} by ${cols} table of zeros. dp[i][j] will hold the side of the largest all-ones square whose bottom-right corner is at (i, j).` }]
  let total = 0
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (matrix[i][j] === 0) {
        frames.push({ phase: 'cell', activeLine: L('if (matrix[i][j] === 0)'), pythonLine: P('if matrix[i][j] == 0'), snapshot: snap(i, j, { value: 0 }), message: `Cell (${i}, ${j}) is 0, so no square ends there.` })
      } else if (i === 0 || j === 0) {
        dp[i][j] = 1
        frames.push({ phase: 'extend', activeLine: L('else if (i === 0'), pythonLine: P('elif i == 0'), snapshot: snap(i, j, { value: 1 }), message: `Cell (${i}, ${j}) is 1 on the top row or left column, so the largest square there is 1.` })
      } else {
        const up = dp[i - 1][j], left = dp[i][j - 1], diag = dp[i - 1][j - 1]
        dp[i][j] = 1 + Math.min(up, left, diag)
        frames.push({ phase: 'extend', activeLine: L('1 + Math.min'), pythonLine: P('1 + min'), snapshot: snap(i, j, { value: 1, up, left, diag }), message: `Cell (${i}, ${j}) is 1. Neighbours up ${up}, left ${left}, diagonal ${diag}, so dp = 1 + ${Math.min(up, left, diag)} = ${dp[i][j]}.` })
      }
      total += dp[i][j]
      frames.push({ phase: 'add', activeLine: L('total += dp'), pythonLine: P('total +='), snapshot: snap(i, j, { total }), message: `Add ${dp[i][j]} from (${i}, ${j}); the running total is ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: snap(null, null, { total }), message: `Return ${total}, the number of all-ones square submatrices.` })
  return { input: { matrix }, result: total, frames }
}

export const code = `function countSquares(matrix) {
  const m = matrix.length
  const n = matrix[0].length
  const dp = Array.from({ length: m }, () => Array(n).fill(0))
  let total = 0
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0) dp[i][j] = 0
      else if (i === 0 || j === 0) dp[i][j] = 1
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      total += dp[i][j]
    }
  }
  return total
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def count_squares(matrix):
    rows, cols = len(matrix), len(matrix[0])
    dp = [[0] * cols for _ in range(rows)]
    total = 0
    for i in range(rows):
        for j in range(cols):
            if matrix[i][j] == 0:
                dp[i][j] = 0
            elif i == 0 or j == 0:
                dp[i][j] = 1
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
            total += dp[i][j]
    return total
`
