const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, m, k } = data ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n must be an integer from 1 to 10.')
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m must be an integer from 1 to 6.')
  if (!Number.isInteger(k) || k < 0 || k > n - 1) throw new Error('k must be an integer from 0 to n-1.')
  return { n, m, k }
}

export const code = `count arrays(n, m, k)
  set table[i][0] to 1 for every row i below n
  for each row i from 1 to n-1 and column j from 1 to min(i, k)
    set table[i][j] to table[i-1][j-1] + table[i-1][j], modulo the prime
  set power to 1
  for each step from 1 to n-1-k
    multiply power by m-1, modulo the prime
  return m * table[n-1][k] * power, modulo the prime`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Choose which k neighbouring pairs are equal (a binomial), give the first value m choices,
// and every other pair must change: m-1 choices each.
export function buildTrace({ n, m, k }) {
  const table = Array.from({ length: n }, () => Array(k + 1).fill(0))
  const frames = []
  const snap = () => table.map(row => [...row])
  for (let i = 0; i < n; i++) {
    table[i][0] = 1
    frames.push({ phase: 'pascal', cell: [i, 0], table: snap(), power: null, activeLine: L('set table[i][0]'), message: `C(${i}, 0) = 1.` })
    for (let j = 1; j <= Math.min(i, k); j++) {
      table[i][j] = (table[i - 1][j - 1] + table[i - 1][j]) % MOD
      frames.push({ phase: 'pascal', cell: [i, j], table: snap(), power: null, activeLine: L('set table[i][j]'), message: `C(${i}, ${j}) = ${table[i][j]}, the choose-or-skip sum.` })
    }
  }
  let power = 1
  frames.push({ phase: 'power', cell: null, table: snap(), power, activeLine: L('set power to 1'), message: `The remaining ${n - 1 - k} pair(s) must change, so the factor is (${m}-1) for each.` })
  for (let step = 1; step <= n - 1 - k; step++) {
    power = (power * (m - 1)) % MOD
    frames.push({ phase: 'power', cell: null, table: snap(), power, activeLine: L('multiply power by'), message: `Step ${step}: power becomes ${power}.` })
  }
  const result = (((m * table[n - 1][k]) % MOD) * power) % MOD
  frames.push({ phase: 'done', cell: [n - 1, k], table: snap(), power, activeLine: L('return m * table'), result, message: `Number of arrays: ${result}.` })
  return { input: { n, m, k }, result, frames }
}

export const python = `def count_arrays(n, m, k):
    MOD = 1000000007
    table = [[0] * (k + 1) for _ in range(n)]
    for i in range(n):
        table[i][0] = 1
        for j in range(1, min(i, k) + 1):
            table[i][j] = (table[i - 1][j - 1] + table[i - 1][j]) % MOD
    power = 1
    for _ in range(n - 1 - k):
        power = power * (m - 1) % MOD
    return m * table[n - 1][k] * power % MOD
`
