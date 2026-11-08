export const phases = [
  { id: 'start', label: 'Start', description: 'Set up a prefix-sum table one row and one column larger than the matrix.' },
  { id: 'prefix', label: 'Build prefix sums', description: 'Each prefix cell holds the sum of the matrix from the top-left corner down to that cell.' },
  { id: 'block', label: 'Block sum', description: 'Clip the k-block to the matrix edges, then read its sum with four prefix lookups.' },
  { id: 'done', label: 'Complete', description: 'Every cell holds the sum of its block.' },
]

export const examples = [
  { label: 'Three by three, k = 1', input: '{"mat":[[1,2,3],[4,5,6],[7,8,9]],"k":1}' },
  { label: 'Two by two, k = 2', input: '{"mat":[[1,2],[3,4]],"k":2}' },
    { label: "Single cell", input: "{\"mat\":[[7]],\"k\":1}" },
    { label: "Equal values", input: "{\"mat\":[[1,1],[1,1]],\"k\":3}" },
    { label: "Eight by eight, all nines", input: "{\"mat\":[[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9],[9,9,9,9,9,9,9,9]],\"k\":8}" },
    { label: "Long run: eight by eight random", input: "{\"mat\":[[4,8,8,0,9,7,0,3],[4,9,6,5,0,2,8,6],[1,9,9,2,1,7,2,3],[7,2,1,8,3,3,5,0],[4,6,3,3,6,3,0,6],[0,0,5,6,5,9,5,2],[0,6,8,0,7,7,7,2],[3,6,0,0,2,0,1,1]],\"k\":5}" },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.mat) || !Number.isInteger(data.k)) throw new Error('Use an object with mat and an integer k, such as {"mat":[[1,2],[3,4]],"k":1}.')
  const m = data.mat.length
  if (m < 1 || m > 8 || !Array.isArray(data.mat[0])) throw new Error('mat must have 1 to 8 rows.')
  const n = data.mat[0].length
  if (n < 1 || n > 8) throw new Error('mat must have 1 to 8 columns.')
  if (data.mat.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row of mat must be a rectangle with the same length.')
  if (data.mat.some(row => row.some(v => !Number.isInteger(v) || v < 0 || v > 9))) throw new Error('Every mat value must be an integer from 0 to 9 in this visualization.')
  if (data.k < 1 || data.k > 8) throw new Error('k is an integer from 1 to 8 in this visualization.')
  return { mat: data.mat, k: data.k }
}

export function buildTrace({ mat, k }) {
  const m = mat.length, n = mat[0].length
  const P = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const answer = Array.from({ length: m }, () => Array(n).fill(null))
  const snap = (extra = {}) => ({ mat, P: P.map(row => [...row]), answer: answer.map(row => [...row]), k, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const P = Array.from'), pythonLine: P0('P = [[0]'), snapshot: snap(),
    message: `Make a ${m + 1} by ${n + 1} table of zeros. Its first row and column stay 0.` }]
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      P[i + 1][j + 1] = P[i][j + 1] + P[i + 1][j] - P[i][j] + mat[i][j]
    }
    frames.push({ phase: 'prefix', activeLine: L('P[i + 1][j + 1] ='), pythonLine: P0('P[i + 1][j + 1]'), snapshot: snap({ row: i }),
      message: `Row ${i} of the prefix table is filled. The bottom-right value ${P[i + 1][n]} is the sum of rows 0 to ${i}.` })
  }
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const r1 = Math.max(0, i - k), c1 = Math.max(0, j - k)
      const r2 = Math.min(m - 1, i + k), c2 = Math.min(n - 1, j + k)
      const value = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
      answer[i][j] = value
      frames.push({ phase: 'block', activeLine: L('answer[i][j] ='), pythonLine: P0('answer[i][j]'), snapshot: snap({ cell: { row: i, col: j }, block: { r1, c1, r2, c2 }, value }),
        message: `Cell (${i}, ${j}) uses rows ${r1} to ${r2} and columns ${c1} to ${c2}: sum ${value}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P0('return answer'), snapshot: snap(),
    message: 'Every block sum is ready.', result: answer })
  return { input: { mat, k }, result: answer, frames }
}

export const code = `function matrixBlockSum(mat, k) {
  const m = mat.length, n = mat[0].length
  const P = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      P[i + 1][j + 1] = P[i][j + 1] + P[i + 1][j] - P[i][j] + mat[i][j]
    }
  }
  const answer = Array.from({ length: m }, () => Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const r1 = Math.max(0, i - k), c1 = Math.max(0, j - k)
      const r2 = Math.min(m - 1, i + k), c2 = Math.min(n - 1, j + k)
      answer[i][j] = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
    }
  }
  return answer
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def matrix_block_sum(mat, k):
    m, n = len(mat), len(mat[0])
    P = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            P[i + 1][j + 1] = P[i][j + 1] + P[i + 1][j] - P[i][j] + mat[i][j]
    answer = [[0] * n for _ in range(m)]
    for i in range(m):
        for j in range(n):
            r1, c1 = max(0, i - k), max(0, j - k)
            r2, c2 = min(m - 1, i + k), min(n - 1, j + k)
            answer[i][j] = P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]
    return answer
`
const P0 = s => python.split('\n').findIndex(l => l.includes(s)) + 1
