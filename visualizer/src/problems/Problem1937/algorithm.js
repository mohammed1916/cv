// LeetCode 1937: row by row, the best score for cell c is its points plus the best earlier cell minus the distance. Two sweeps (left to right and right to left) find that best value for every column in linear time.
const SOURCE = [
  "function maxPoints(points) {",
  "  const m = points.length, n = points[0].length",
  "  let dp = [...points[0]]",
  "  for (let r = 1; r < m; r++) {",
  "    const left = new Array(n), right = new Array(n)",
  "    left[0] = dp[0]",
  "    for (let c = 1; c < n; c++) left[c] = Math.max(left[c - 1] - 1, dp[c])",
  "    right[n - 1] = dp[n - 1]",
  "    for (let c = n - 2; c >= 0; c--) right[c] = Math.max(right[c + 1] - 1, dp[c])",
  "    dp = dp.map((_, c) => Math.max(left[c], right[c]) + points[r][c])",
  "  }",
  "  return Math.max(...dp)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_points(points):
    m, n = len(points), len(points[0])
    dp = points[0][:]
    for r in range(1, m):
        left = [0] * n
        right = [0] * n
        left[0] = dp[0]
        for c in range(1, n):
            left[c] = max(left[c - 1] - 1, dp[c])
        right[n - 1] = dp[n - 1]
        for c in range(n - 2, -1, -1):
            right[c] = max(right[c + 1] - 1, dp[c])
        dp = [max(left[c], right[c]) + points[r][c] for c in range(n)]
    return max(dp)
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'left', label: 'Left sweep', description: 'Best score reaching each column from the left.' },
  { id: 'right', label: 'Right sweep', description: 'Best score reaching each column from the right.' },
  { id: 'combine', label: 'Combine', description: 'Add this row\'s points to the better side.' },
  { id: 'done', label: 'Result', description: 'Best total over the last row.' },
]

export function parseInput(text) {
  let points
  try { points = JSON.parse(text) } catch { throw new Error('Enter a JSON matrix, for example [[1,2,3],[1,5,1],[3,1,1]].') }
  if (!Array.isArray(points) || points.length < 1 || points.length > 5) throw new Error('Use 1 to 5 rows.')
  const n = points[0]?.length
  if (!n || n > 6 || !points.every(row => Array.isArray(row) && row.length === n && row.every(v => Number.isInteger(v) && v >= 0 && v <= 100000))) throw new Error('A rectangle of integers from 0 to 100000, at most 6 columns.')
  return { points }
}

export function buildTrace({ points }) {
  const m = points.length, n = points[0].length
  let dp = [...points[0]]
  const frames = [{ phase: 'combine', activeLine: L('let dp = [...points[0]]'), pythonLine: P('dp = points[0]'), message: 'Row 0: each cell scores its own points.', row: 0, dp: [...dp], left: null, right: null, chosen: null }]
  for (let r = 1; r < m; r++) {
    const left = new Array(n), right = new Array(n)
    left[0] = dp[0]
    for (let c = 1; c < n; c++) {
      left[c] = Math.max(left[c - 1] - 1, dp[c])
      frames.push({ phase: 'left', activeLine: L('left[c] = Math.max'), pythonLine: P('left[c] = max'), message: `Row ${r}, column ${c} from the left: ${left[c]}.`, row: r, dp: [...dp], left: [...left.slice(0, c + 1)], right: null, chosen: null })
    }
    right[n - 1] = dp[n - 1]
    for (let c = n - 2; c >= 0; c--) {
      right[c] = Math.max(right[c + 1] - 1, dp[c])
      frames.push({ phase: 'right', activeLine: L('right[c] = Math.max'), pythonLine: P('right[c] = max'), message: `Row ${r}, column ${c} from the right: ${right[c]}.`, row: r, dp: [...dp], left: [...left], right: [...right.map((v, k) => (k >= c ? v : undefined))], chosen: null })
    }
    dp = dp.map((_, c) => Math.max(left[c], right[c]) + points[r][c])
    frames.push({ phase: 'combine', activeLine: L('dp = dp.map'), pythonLine: P('dp = [max'), message: `Row ${r} totals: ${dp.join(', ')}.`, row: r, dp: [...dp], left: [...left], right: [...right], chosen: null })
  }
  const result = Math.max(...dp)
  frames.push({ phase: 'done', activeLine: L('return Math.max(...dp)'), pythonLine: P('return max(dp)'), message: `Best total: ${result}.`, row: m - 1, dp: [...dp], left: null, right: null, chosen: null, result })
  return { input: { points }, result, frames }
}
