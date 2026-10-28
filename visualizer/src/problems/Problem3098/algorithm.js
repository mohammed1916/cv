const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object with an array nums and an integer k, for example {"nums":[1,2,3,4],"k":3}.')
  const n = data.nums.length
  if (n < 2 || n > 10) throw new Error('nums must have 2 to 10 entries.')
  if (!data.nums.every(v => Number.isInteger(v) && v >= -50 && v <= 50)) throw new Error('Values must be integers from -50 to 50.')
  if (data.k < 2 || data.k > n) throw new Error('k must be from 2 to the length of nums.')
  return { nums: data.nums, k: data.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  const diffs = new Set([0])
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) diffs.add(a[j] - a[i])
  const thresholds = [...diffs].sort((x, y) => x - y)
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set a to nums'), threshold: null, weight: null, count: null, total, sorted: a.slice(), result: null, message: `Sort the values. Each possible smallest gap is one of the ${thresholds.length} distinct differences.` }]
  for (let j = 1; j < thresholds.length; j++) {
    const t = thresholds[j]
    const weight = t - thresholds[j - 1]
    const ways = [Array.from({ length: n }, () => 1)]
    for (let size = 2; size <= k; size++) {
      const prev = ways[size - 2]
      const cur = Array.from({ length: n }, () => 0)
      for (let i = 0; i < n; i++) {
        for (let p = 0; p < i; p++) if (a[i] - a[p] >= t) cur[i] += prev[p]
      }
      ways.push(cur)
    }
    const count = ways[k - 1].reduce((sum, v) => sum + v, 0)
    total += weight * count
    frames.push({ phase: 'threshold', activeLine: L('add weight times'), threshold: t, weight, count, total, sorted: a.slice(), result: null, message: `Subsequences whose smallest gap is at least ${t}: ${count}. Each adds ${weight} for the range (${thresholds[j - 1]}, ${t}].` })
  }
  const result = total % MOD
  frames.push({ phase: 'done', activeLine: L('return total modulo'), threshold: null, weight: null, count: null, total, sorted: a.slice(), result, message: `Sum of powers modulo 1000000007: ${result}.` })
  return { input, result, frames }
}

export const code = `sum of subsequence powers (nums, k)
  set a to nums sorted in increasing order
  set thresholds to 0 and every difference between two values of a, sorted without repeats
  set total to 0
  for each threshold t after the first one
    set weight to t minus the previous threshold
    set ways[1][i] to 1 for every index i
    for each size from 2 to k
      set ways[size][i] to the sum of ways[size minus 1][p] over earlier indices p with a[i] minus a[p] at least t
    add weight times the number of size-k subsequences in ways to total
  return total modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_subsequence_powers(nums, k):
    MOD = 10**9 + 7
    a = sorted(nums)
    n = len(a)
    diffs = {0}
    for i in range(n):
        for j in range(i + 1, n):
            diffs.add(a[j] - a[i])
    thresholds = sorted(diffs)
    total = 0
    for j in range(1, len(thresholds)):
        t = thresholds[j]
        weight = t - thresholds[j - 1]
        ways = [1] * n
        for size in range(2, k + 1):
            cur = [0] * n
            for i in range(n):
                cur[i] = sum(ways[p] for p in range(i) if a[i] - a[p] >= t)
            ways = cur
        total += weight * sum(ways)
    return total % MOD
`
