export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 9 || !nums.every(v => Number.isInteger(v) && v >= 0 && v <= 9)) {
    throw new Error('nums has 1 to 9 integers from 0 to 9.')
  }
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is between 1 and the length of nums.')
  return { nums, k }
}

const costOf = s => (s * (s + 1)) / 2

// dp[j][i] is the least cost of splitting the first i values into exactly j nonempty parts.
// The last part runs from p to i-1, so dp[j][i] = min over p of dp[j-1][p] + cost(sum of that part).
export function buildTrace({ nums, k }) {
  const n = nums.length
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(null))
  const from = Array.from({ length: k + 1 }, () => Array(n + 1).fill(-1))
  dp[0][0] = 0
  const frames = []
  const snap = extra => ({ dp: dp.map(r => r.slice()), from: from.map(r => r.slice()), ...extra })
  frames.push(snap({ pythonLine: PY('prefix = [0]'), phase: 'start', activeLine: L('dp[0][0] = 0 and every other entry'), j: -1, i: -1, p: -1, cost: null, message: `Split ${n} values into ${k} part${k === 1 ? '' : 's'}.` }))
  for (let j = 1; j <= k; j += 1) {
    for (let i = j; i <= n; i += 1) {
      let best = null
      let bestP = -1
      for (let p = j - 1; p < i; p += 1) {
        if (dp[j - 1][p] === null) continue
        const s = prefix[i] - prefix[p]
        const candidate = dp[j - 1][p] + costOf(s)
        if (best === null || candidate < best) {
          best = candidate
          bestP = p
        }
      }
      dp[j][i] = best
      from[j][i] = bestP
      frames.push(snap({ pythonLine: PY('for i in range(j, n + 1)'), phase: 'cell', activeLine: L('for end i from j to n'), j, i, p: bestP, cost: best, message: `${j} part${j === 1 ? '' : 's'} over the first ${i} values: best cost ${best}, last part starts at index ${bestP}.` }))
    }
  }
  const answer = dp[k][n]
  frames.push(snap({ pythonLine: PY('return dp[k][n]'), phase: 'done', activeLine: L('return dp[k][n]'), j: k, i: n, p: -1, cost: answer, message: `Minimum total cost: ${answer}.` }))
  return { input: { nums, k }, result: answer, frames }
}

export const code = `minimum total cost of splitting nums into exactly k nonempty parts
  prefix = running sums of nums
  dp[0][0] = 0 and every other entry is unset
  for parts j from 1 to k
    for end i from j to n
      for start p from j minus 1 up to i minus 1
        s = sum of nums from p to i minus 1
        candidate = dp[j-1][p] plus s times (s+1) divided by 2
        keep the smallest candidate in dp[j][i]
  return dp[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_partition_score(nums, k):
    n = len(nums)
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + v)
    INF = float('inf')
    dp = [[INF] * (n + 1) for _ in range(k + 1)]
    dp[0][0] = 0
    for j in range(1, k + 1):
        for i in range(j, n + 1):
            for p in range(j - 1, i):
                s = prefix[i] - prefix[p]
                cand = dp[j - 1][p] + s * (s + 1) // 2
                if cand < dp[j][i]:
                    dp[j][i] = cand
    return dp[k][n]
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
