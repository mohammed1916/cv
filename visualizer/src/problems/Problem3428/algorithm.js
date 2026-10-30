export const python = `def maxMinSubsequenceSum(nums, k):
    MOD = 10**9 + 7
    a = sorted(nums)
    n = len(a)
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % MOD
    inv_fact = [1] * (n + 1)
    inv_fact[n] = pow(fact[n], MOD - 2, MOD)
    for i in range(n, 0, -1):
        inv_fact[i - 1] = inv_fact[i] * i % MOD
    def choose(x, t):
        return fact[x] * inv_fact[t] % MOD * inv_fact[x - t] % MOD
    g = [sum(choose(d, t) for t in range(min(k - 2, d) + 1)) % MOD for d in range(n)]
    H = []
    running = 0
    for d in range(n):
        running = (running + g[d]) % MOD
        H.append(running)
    def prefix(m):
        return H[m] if m >= 0 else 0
    total = 2 * sum(a) % MOD
    for x in range(n):
        total = (total + a[x] * (prefix(n - 2 - x) + prefix(x - 1))) % MOD
    return total
`

const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const code = [
  'FUNCTION maxMinSubsequenceSum(nums, k)',
  'sort nums ascending into a',
  'FOR d FROM 0 TO n − 1, g[d] ← number of subsets of size at most k − 2 from d items',
  'H[d] ← H[d − 1] + g[d], the running prefix sum',
  'total ← 2 × sum of a (single-element subsequences)',
  'FOR x FROM 0 TO n − 1',
  'total ← total + a[x] × (H[n − 2 − x] + H[x − 1])',
  'RETURN total mod 1000000007',
].map((text, index) => ({ line: index + 1, text }))

export function parseInput(text) {
  const data = typeof text === 'string' ? JSON.parse(text) : text
  if (!data || typeof data !== 'object') throw new Error('Use a JSON object with nums and k.')
  const { nums, k } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 values for this visualization.')
  if (!nums.every(value => Number.isInteger(value) && value >= 0 && value <= 99)) throw new Error('Each nums value must be an integer from 0 to 99 for this visualization.')
  if (!Number.isInteger(k) || k < 1 || k > Math.min(70, nums.length)) throw new Error('k must be an integer from 1 to min(70, nums.length).')
  return { nums: [...nums], k }
}

function combBig(a, b) {
  if (b < 0 || b > a) return 0n
  let r = 1n
  for (let i = 1; i <= b; i++) r = (r * BigInt(a - b + i)) / BigInt(i)
  return r
}

export function buildTrace(input) {
  const { nums, k } = input
  const a = [...nums].sort((x, y) => x - y)
  const n = a.length
  const MOD = 1000000007n
  const g = Array(n).fill(null)
  const H = Array(n).fill(null)
  const hAt = m => (m < 0 ? 0n : H[m])
  const frames = []
  let total = null
  const snap = extra => ({ a, g: [...g], H: [...H], x: -1, total, result: null, ...extra })
  frames.push(snap({ phase: 'setup', activeLine: 2, pythonLine: P('a = sorted(nums)'),
    message: `Sorted values: ${a.join(', ')}. Each subsequence's minimum and maximum come from two sorted positions.` }))
  for (let d = 0; d < n; d++) {
    let count = 0n
    for (let t = 0; t <= Math.min(k - 2, d); t++) count += combBig(d, t)
    g[d] = count
    frames.push(snap({ phase: 'gaps', activeLine: 3, pythonLine: P('g = [sum('), d,
      message: `Items strictly between two chosen ends: d = ${d} gives ${count} ways to add at most ${k - 2} middle elements.` }))
  }
  let running = 0n
  for (let d = 0; d < n; d++) {
    running += g[d]
    H[d] = running
    frames.push(snap({ phase: 'prefix', activeLine: 4, pythonLine: P('H.append(running)'), d,
      message: `H[${d}] = ${running}, the running sum of the gap counts.` }))
  }
  total = (2n * a.reduce((sum, value) => sum + BigInt(value), 0n))
  frames.push(snap({ phase: 'singles', activeLine: 5, pythonLine: P('total = 2 * sum'),
    message: `Single-element subsequences contribute 2 × their value, giving ${total}.` }))
  for (let x = 0; x < n; x++) {
    const weight = hAt(n - 2 - x) + hAt(x - 1)
    total += BigInt(a[x]) * weight
    frames.push(snap({ phase: 'pairs', activeLine: 7, pythonLine: P('total = (total + a[x]'), x, total,
      message: `a[${x}] = ${a[x]} is a minimum or maximum of ${weight} pairs, so the total is now ${total}.` }))
  }
  const result = Number(total % MOD)
  frames.push(snap({ phase: 'done', activeLine: 8, pythonLine: P('return total'), x: -1, total, result,
    message: `Return ${total} mod 1000000007 = ${result}.` }))
  return { input, result, frames }
}
