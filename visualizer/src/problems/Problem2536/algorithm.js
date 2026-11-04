export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n and queries.')
  const { n, queries } = data
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries must be an array of 1 to 8 [r1, c1, r2, c2] entries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 4 || !q.every(Number.isInteger)) throw new Error('Each query is [r1, c1, r2, c2] with integers.')
    const [r1, c1, r2, c2] = q
    if (r1 < 0 || c1 < 0 || r2 < r1 || c2 < c1 || r2 >= n || c2 >= n) throw new Error('Each query needs 0 <= r1 <= r2 < n and 0 <= c1 <= c2 < n.')
  }
  return { n, queries }
}

const CODE = [
  'function incrementSubmatrices(n, queries) {',
  '  const diff = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))',
  '  for (const [r1, c1, r2, c2] of queries) {',
  '    diff[r1][c1]++; diff[r1][c2 + 1]--; diff[r2 + 1][c1]--; diff[r2 + 1][c2 + 1]++',
  '  }',
  '  const grid = Array.from({ length: n }, () => Array(n).fill(0))',
  '  for (let i = 0; i < n; i++) {',
  '    for (let j = 0; j < n; j++) {',
  '      let value = diff[i][j]',
  '      if (i > 0) value += grid[i - 1][j]',
  '      if (j > 0) value += grid[i][j - 1]',
  '      if (i > 0 && j > 0) value -= grid[i - 1][j - 1]',
  '      grid[i][j] = value',
  '    }',
  '  }',
  '  return grid',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

export function buildTrace({ n, queries }) {
  const diff = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const frames = [{ phase: 'start', activeLine: L('const diff = Array.from'), pythonLine: 2, cell: null, grid: null, message: 'Mark each rectangle at its corners in a difference grid.' }]
  for (const [r1, c1, r2, c2] of queries) {
    diff[r1][c1] += 1
    diff[r1][c2 + 1] -= 1
    diff[r2 + 1][c1] -= 1
    diff[r2 + 1][c2 + 1] += 1
    frames.push({ phase: 'mark', activeLine: L('for (const [r1, c1, r2, c2] of queries) {'), pythonLine: 3, cell: [r1, c1], grid: null, message: `Query [${r1}, ${c1}, ${r2}, ${c2}] marks four corners of the difference grid.` })
  }
  const grid = Array.from({ length: n }, () => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let value = diff[i][j]
      if (i > 0) value += grid[i - 1][j]
      if (j > 0) value += grid[i][j - 1]
      if (i > 0 && j > 0) value -= grid[i - 1][j - 1]
      grid[i][j] = value
    }
    frames.push({ phase: 'sum', activeLine: L('for (let i = 0; i < n; i++) {'), pythonLine: 18, cell: [i, n - 1], grid: grid.map(row => [...row]), message: `Row ${i} is finished with prefix sums.` })
  }
  frames.push({ phase: 'done', activeLine: L('return grid'), pythonLine: 19, cell: null, grid: grid.map(row => [...row]), message: 'Every cell now holds how many queries cover it.' })
  return { input: { n, queries }, result: grid, frames }
}

export const python = `def increment_submatrices(n, queries):
    diff = [[0] * (n + 1) for _ in range(n + 1)]
    for r1, c1, r2, c2 in queries:
        diff[r1][c1] += 1
        diff[r1][c2 + 1] -= 1
        diff[r2 + 1][c1] -= 1
        diff[r2 + 1][c2 + 1] += 1
    grid = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            value = diff[i][j]
            if i > 0:
                value += grid[i - 1][j]
            if j > 0:
                value += grid[i][j - 1]
            if i > 0 and j > 0:
                value -= grid[i - 1][j - 1]
            grid[i][j] = value
    return grid
`
