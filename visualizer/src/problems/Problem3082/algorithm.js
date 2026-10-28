const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 6 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 5)) {
    throw new Error('nums must be 1 to 6 integers, each from 1 to 5.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 10) throw new Error('k must be an integer from 1 to 10.')
  return { nums, k }
}

export const code = `sum of the power of all subsequences(nums, k)
  ways = table with k + 1 rows and n + 1 columns, filled with 0
  ways[0][0] = 1
  for each value x in nums
    for s from k down to x
      for c from n down to 1
        ways[s][c] = ways[s][c] + ways[s - x][c - 1], modulo 1000000007
  total = sum over c from 0 to n of ways[k][c] times 2 to the power (n - c), modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const copy = table => table.map(row => [...row])

// ways[s][c] counts the chosen sets of values so far with sum s and c members. A set T with sum k is inside 2^(n - |T|) subsequences.
export function buildTrace({ nums, k }) {
  const n = nums.length
  const ways = Array.from({ length: k + 1 }, () => Array(n + 1).fill(0))
  ways[0][0] = 1
  const frames = [{ phase: 'start', item: null, table: copy(ways), activeLine: L('ways[0][0] = 1'), message: 'The empty set has sum 0 and no members.' }]
  for (const x of nums) {
    for (let s = k; s >= x; s--) {
      for (let c = n; c >= 1; c--) ways[s][c] = (ways[s][c] + ways[s - x][c - 1]) % MOD
    }
    const atK = ways[k].reduce((a, b) => a + b, 0)
    frames.push({ phase: 'item', item: x, table: copy(ways), activeLine: L('ways[s][c] = ways[s][c]'), message: `Adding ${x}: ${atK} sets reach sum ${k} so far.` })
  }
  let total = 0
  for (let c = 0; c <= n; c++) total = (total + ways[k][c] * 2 ** (n - c)) % MOD
  frames.push({ phase: 'done', item: null, table: copy(ways), activeLine: L('return total'), message: `Sum of powers: ${total}.` })
  return { input: { nums, k }, result: total, frames }
}

export const python = `def sum_of_power(nums, k):
    MOD = 1000000007
    n = len(nums)
    ways = [[0] * (n + 1) for _ in range(k + 1)]
    ways[0][0] = 1
    for x in nums:
        for s in range(k, x - 1, -1):
            for c in range(n, 0, -1):
                ways[s][c] = (ways[s][c] + ways[s - x][c - 1]) % MOD
    total = 0
    for c in range(n + 1):
        total = (total + ways[k][c] * pow(2, n - c, MOD)) % MOD
    return total
`
