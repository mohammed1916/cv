export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use an object with a nums array and an integer k.')
  if (obj.nums.length < 1 || obj.nums.length > 8) throw new Error('Use 1 to 8 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Values are integers from 1 to 1000000000.')
  if (obj.k < 1 || obj.k > obj.nums.length) throw new Error('k must be from 1 to the length of nums.')
  return { nums: obj.nums, k: obj.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  const NEG = -Infinity
  let best = NEG
  const frames = [{ phase: 'start', activeLine: L('set best to minus infinity'), start: -1, best: 0, message: `Each cut position in the circle can be the start of a line. Try all ${n} starts and split each line into at most ${k} pieces.` }]
  for (let s = 0; s < n; s++) {
    const b = [...nums.slice(s), ...nums.slice(0, s)]
    const dp = Array.from({ length: k + 1 }, () => Array(n + 1).fill(NEG))
    dp[0][0] = 0
    for (let j = 1; j <= k; j++) {
      for (let i = 1; i <= n; i++) {
        for (let p = 0; p < i; p++) {
          if (dp[j - 1][p] === NEG) continue
          const seg = b.slice(p, i)
          const value = dp[j - 1][p] + Math.max(...seg) - Math.min(...seg)
          if (value > dp[j][i]) dp[j][i] = value
        }
      }
    }
    for (let j = 1; j <= k; j++) best = Math.max(best, dp[j][n])
    frames.push({ phase: 'start-cut', activeLine: L('for each start position s'), start: s, best, message: `Start at position ${s}: the line is ${b.join(', ')}. Best score so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, best, message: `Maximum cyclic partition score: ${best}.` })
  return { input, result: best, frames }
}

export const code = `maximum cyclic partition score with at most k arcs:
  set best to minus infinity
  for each start position s in the cycle:
    set b to nums rotated so that it begins at s
    set dp[0][0] to 0 and every other entry to minus infinity
    for each piece count j from 1 to k:
      for each end i from 1 to n:
        for each start p of the last piece before i:
          set dp[j][i] to the larger of itself and dp[j - 1][p] plus range of b[p..i-1]
    update best with dp[j][n] for every j
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_cyclic_partition_score(nums, k):
    n = len(nums)
    NEG = float('-inf')
    best = NEG
    for s in range(n):
        b = nums[s:] + nums[:s]
        dp = [[NEG] * (n + 1) for _ in range(k + 1)]
        dp[0][0] = 0
        for j in range(1, k + 1):
            for i in range(1, n + 1):
                for p in range(i):
                    if dp[j - 1][p] == NEG:
                        continue
                    seg = b[p:i]
                    value = dp[j - 1][p] + max(seg) - min(seg)
                    if value > dp[j][i]:
                        dp[j][i] = value
        for j in range(1, k + 1):
            best = max(best, dp[j][n])
    return best
`
