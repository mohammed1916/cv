export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with integer fields n, m and k.')
  const { n, m, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n must be an integer from 1 to 8.')
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m must be an integer from 1 to 6.')
  if (!Number.isInteger(k) || k < 0 || k > n) throw new Error('k must be an integer from 0 to n.')
  return { n, m, k }
}

const MOD = 1000000007
const emptyTable = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(0))
const copyTable = table => table.map(row => [...row])

export function buildTrace(input) {
  const { n, m, k } = input
  let prev = emptyTable(m + 1, k + 1)
  prev[0][0] = 1
  const frames = [{ phase: 'start', activeLine: L('set ways[0][0]'), length: 0, row: -1, column: -1, table: copyTable(prev), total: null, message: 'Start with the empty array: one way, with largest value 0 and cost 0.' }]
  for (let length = 1; length <= n; length++) {
    const cur = emptyTable(m + 1, k + 1)
    for (let j = 1; j <= m; j++) {
      for (let c = 0; c <= k; c++) {
        let ways = j * prev[j][c]
        if (c >= 1) for (let t = 0; t < j; t++) ways += prev[t][c - 1]
        cur[j][c] = ways % MOD
        frames.push({ phase: 'cell', activeLine: L('set ways to j times'), length, row: j, column: c, table: copyTable(cur), total: null, message: `Length ${length}, largest value ${j}, cost ${c}: ${cur[j][c]} arrays.` })
      }
    }
    prev = cur
  }
  let total = 0
  for (let j = 1; j <= m; j++) total += prev[j][k]
  total %= MOD
  frames.push({ phase: 'done', activeLine: L('return the sum'), length: n, row: -1, column: -1, table: copyTable(prev), total, message: `${total} arrays of length ${n} have exactly ${k} search costs.` })
  return { input, result: total, frames }
}

export const code = `count arrays with exactly k search costs (n, m, k):
  set ways[0][0] to 1 for the empty array, and 0 elsewhere
  repeat n times:
    make a new table cur of zeros
    for each largest value j from 1 to m:
      for each cost c from 0 to k:
        set ways to j times the previous ways[j][c]
        if c is at least 1 then add the previous ways[t][c - 1] for each t below j
        store ways in cur[j][c] modulo 1000000007
    replace the previous table with cur
  return the sum of ways[j][k] for j from 1 to m, modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_of_arrays(n, m, k):
    MOD = 1000000007
    prev = [[0] * (k + 1) for _ in range(m + 1)]
    prev[0][0] = 1
    for _ in range(n):
        cur = [[0] * (k + 1) for _ in range(m + 1)]
        for j in range(1, m + 1):
            for c in range(k + 1):
                ways = j * prev[j][c]
                if c >= 1:
                    ways += sum(prev[t][c - 1] for t in range(j))
                cur[j][c] = ways % MOD
        prev = cur
    return sum(prev[j][k] for j in range(1, m + 1)) % MOD
`
