const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k } = data ?? {}
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('n must be an integer from 2 to 12.')
  if (!Number.isInteger(k) || k < 1 || k > 6) throw new Error('k must be an integer from 1 to 6.')
  return { n, k }
}

export const code = `count sets(n, k)
  set pascal[i][0] to 1 for every row i up to n+k-1
  for each row i from 1 to n+k-1 and column j from 1 to min(i, 2k)
    set pascal[i][j] to pascal[i-1][j-1] + pascal[i-1][j], modulo the prime
  return pascal[n+k-1][2k]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each segment uses two endpoints, and segments may share an endpoint, so choose 2k of the n+k-1 slots: C(n+k-1, 2k).
export function buildTrace({ n, k }) {
  const rows = n + k
  const cols = 2 * k
  const pascal = Array.from({ length: rows }, () => Array(cols + 1).fill(0))
  const frames = []
  const snap = () => pascal.map(row => [...row])
  for (let i = 0; i < rows; i++) {
    pascal[i][0] = 1
    frames.push({ phase: 'pascal', cell: [i, 0], table: snap(), activeLine: L('set pascal[i][0]'), message: `C(${i}, 0) = 1.` })
    for (let j = 1; j <= Math.min(i, cols); j++) {
      pascal[i][j] = (pascal[i - 1][j - 1] + pascal[i - 1][j]) % MOD
      frames.push({ phase: 'pascal', cell: [i, j], table: snap(), activeLine: L('set pascal[i][j]'), message: `C(${i}, ${j}) = ${pascal[i][j]}.` })
    }
  }
  const result = pascal[n + k - 1][cols]
  frames.push({ phase: 'done', cell: [n + k - 1, cols], table: snap(), activeLine: L('return pascal'), result, message: `C(${n + k - 1}, ${cols}) = ${result} sets of ${k} segments.` })
  return { input: { n, k }, result, frames }
}

export const python = `def count_sets(n, k):
    MOD = 1000000007
    rows = n + k
    cols = 2 * k
    pascal = [[0] * (cols + 1) for _ in range(rows)]
    for i in range(rows):
        pascal[i][0] = 1
        for j in range(1, min(i, cols) + 1):
            pascal[i][j] = (pascal[i - 1][j - 1] + pascal[i - 1][j]) % MOD
    return pascal[n + k - 1][cols]
`
