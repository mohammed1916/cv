export const phases = [
  { id: 'prefix', label: 'Build 2D prefix sums', description: 'Store the sum of the rectangle from the top-left corner to each cell. Any rectangle then costs four lookups.' },
  { id: 'window', label: 'Block sum', description: 'For each cell, clip its k-neighbourhood to the grid and read that rectangle from the prefix table.' },
  { id: 'done', label: 'Complete', description: 'Return the block sum for every cell.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.mat) || !Number.isInteger(input.k)) throw new Error('Use an object such as {"mat": [[1, 2], [3, 4]], "k": 1}.')
  const { mat, k } = input
  if (mat.length < 1 || mat.length > 5 || mat.some(row => !Array.isArray(row) || row.length !== mat[0].length || row.length < 1 || row.length > 5)) throw new Error('mat is a rectangle of 1 to 5 rows and 1 to 5 columns.')
  if (!mat.every(row => row.every(v => Number.isInteger(v) && v >= 0 && v <= 9))) throw new Error('Each cell is an integer from 0 to 9.')
  if (k < 0 || k > 4) throw new Error('k is an integer from 0 to 4.')
  return { mat, k }
}

export function buildTrace({ mat, k }) {
  const m = mat.length, n = mat[0].length
  const P = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const frames = []
  const snap = extra => ({ mat, P: P.map(row => [...row]), k, ...extra })
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      P[r + 1][c + 1] = mat[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
      frames.push({ phase: 'prefix', activeLine: L('P[r + 1][c + 1]'), pythonLine: PY('P[r + 1][c + 1]'), snapshot: snap({ cell: [r, c], ans: null, rect: null }),
        message: `Prefix at (${r + 1}, ${c + 1}) is ${mat[r][c]} plus the cells above and to the left, which is ${P[r + 1][c + 1]}.` })
    }
  }
  const ans = Array.from({ length: m }, () => Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const r1 = Math.max(0, i - k), r2 = Math.min(m - 1, i + k)
      const c1 = Math.max(0, j - k), c2 = Math.min(n - 1, j + k)
      ans[i][j] = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
      frames.push({ phase: 'window', activeLine: L('ans[i][j] ='), pythonLine: PY('ans[i][j] ='), snapshot: snap({ cell: [i, j], ans: ans.map(row => [...row]), rect: [r1, r2, c1, c2] }),
        message: `Cell (${i}, ${j}) covers rows ${r1} to ${r2} and columns ${c1} to ${c2}. Four prefix lookups give ${ans[i][j]}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ans'), pythonLine: PY('return ans'), snapshot: snap({ cell: null, ans: ans.map(row => [...row]), rect: null }),
    message: 'Every cell now holds its block sum.' })
  return { input: { mat, k }, result: ans, frames }
}

export const code = `block sum(mat, k):
  m = rows, n = columns
  P = (m + 1) by (n + 1) table of zeros
  for r from 0 to m - 1:
    for c from 0 to n - 1:
      P[r + 1][c + 1] = mat[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
  for i from 0 to m - 1:
    for j from 0 to n - 1:
      r1 = max(0, i - k), r2 = min(m - 1, i + k)
      c1 = max(0, j - k), c2 = min(n - 1, j + k)
      ans[i][j] = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
  return ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def block_sum(mat, k):
    m, n = len(mat), len(mat[0])
    P = [[0] * (n + 1) for _ in range(m + 1)]
    for r in range(m):
        for c in range(n):
            P[r + 1][c + 1] = mat[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    ans = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            r1, r2 = max(0, i - k), min(m - 1, i + k)
            c1, c2 = max(0, j - k), min(n - 1, j + k)
            ans[i][j] = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
    return ans`
const PY = s => python.split('\n').findIndex(l => l.includes(s)) + 1
