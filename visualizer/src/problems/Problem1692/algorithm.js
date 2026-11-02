// LeetCode 1692 (draft): Count Ways to Distribute Candies.
// Input: { n, k }: n distinct candies go into k nonempty, unlabeled bags. Count the partitions, modulo 1000000007.
// Visualization cap: 1 <= k <= n <= 12. The count is the Stirling number of the second kind S(n, k).

const CODE_TEXT = `FUNCTION countWays(n, k)
    table ← (n + 1) by (k + 1) grid of zeros, table[0][0] ← 1
    FOR i from 1 to n
        FOR j from 1 to k
            table[i][j] ← (j times table[i-1][j] plus table[i-1][j-1]) modulo 1000000007
    RETURN table[n][k]`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_ways(n, k):
    MOD = 1000000007
    table = [[0] * (k + 1) for _ in range(n + 1)]
    table[0][0] = 1
    for i in range(1, n + 1):
        for j in range(1, k + 1):
            table[i][j] = (j * table[i - 1][j] + table[i - 1][j - 1]) % MOD
    return table[n][k]
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Base', description: 'With no candies, exactly one way fills zero bags.' },
  { id: 'cell', label: 'Candy i', description: 'The newest candy joins an existing bag, or opens a new one.' },
  { id: 'answer', label: 'Result', description: 'The filled entry for n candies and k bags.' },
]

const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and k.')
  const { n, k } = input
  if (!Number.isInteger(n) || !Number.isInteger(k) || k < 1 || k > n || n > 12) throw new Error('Use integers with 1 <= k <= n <= 12.')
  return { n, k }
}

export function buildTrace({ n, k }) {
  const table = Array.from({ length: n + 1 }, () => Array(k + 1).fill(0))
  table[0][0] = 1
  const frames = []
  frames.push({ pythonLine: P('table[0][0] = 1'), phase: 'start', activeLine: L('table[0][0] ← 1'), i: 0, j: 0, table: table.map(r => [...r]), message: 'Zero candies and zero bags: one way.' })
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= k; j++) {
      const joinExisting = (j * table[i - 1][j]) % MOD
      const openNew = table[i - 1][j - 1] % MOD
      table[i][j] = (joinExisting + openNew) % MOD
      frames.push({ pythonLine: P('table[i][j] = (j * table[i - 1][j]'), phase: 'cell', activeLine: L('table[i][j] ← (j times table[i-1][j]'), i, j, joinExisting, openNew, table: table.map(r => [...r]), message: `Candy ${i}, ${j} bags: ${j} x ${table[i - 1][j]} (join a bag) + ${table[i - 1][j - 1]} (open bag ${j}) = ${table[i][j]}.` })
    }
  }
  const result = table[n][k]
  frames.push({ pythonLine: P('return table[n][k]'), phase: 'answer', activeLine: L('RETURN table[n][k]'), i: n, j: k, table: table.map(r => [...r]), message: `${n} candies in ${k} nonempty bags: ${result} ways.` })
  return { input: { n, k }, result, frames }
}
