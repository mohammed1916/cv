const MAX_LENGTH = 10

export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums, k } = data ?? {}
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LENGTH || nums.some(v => !Number.isInteger(v) || v < 1 || v > 4)) throw new Error(`nums must be 1 to ${MAX_LENGTH} integers from 1 to 4.`)
  if (!Number.isInteger(k) || k < 0 || k > 3) throw new Error('k must be an integer from 0 to 3.')
  return { nums, k }
}

export const code = `length of the longest good subsequence, where at most k neighbours differ
  set best to 0
  for each index i from 0 to n minus 1
    set dp[i][0] to 1, and dp[i][c] to nothing for every other count c
    for each count c from 0 to k
      for each earlier index j from 0 to i minus 1
        set cost to 1 if nums[j] differs from nums[i], otherwise 0
        if c minus cost is at least 0 and dp[j][c minus cost] is set then
          set dp[i][c] to the larger of dp[i][c] and dp[j][c minus cost] plus 1
    set best to the largest value in row dp[i]
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ nums, k }) {
  const n = nums.length
  const dp = Array.from({ length: n }, () => Array(k + 1).fill(null))
  let best = 0
  const frames = [{ phase: 'start', index: -1, dp: [], activeLine: L('set best to 0'), message: 'No subsequence yet.' }]
  for (let i = 0; i < n; i++) {
    dp[i][0] = 1
    for (let c = 0; c <= k; c++) {
      for (let j = 0; j < i; j++) {
        const cost = nums[j] !== nums[i] ? 1 : 0
        if (c - cost >= 0 && dp[j][c - cost] !== null && (dp[i][c] === null || dp[j][c - cost] + 1 > dp[i][c])) {
          dp[i][c] = dp[j][c - cost] + 1
        }
      }
    }
    const rowBest = Math.max(...dp[i].filter(v => v !== null))
    if (rowBest > best) best = rowBest
    frames.push({ phase: 'row', index: i, dp: dp.slice(0, i + 1).map(r => [...r]), activeLine: L('set dp[i][0] to 1'), message: `Ending at ${nums[i]} (index ${i}): best is ${rowBest}; overall ${best}.` })
  }
  frames.push({ phase: 'done', index: n - 1, dp: dp.map(r => [...r]), activeLine: L('return best'), message: `Longest good subsequence: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const python = `def maximum_length_good_subsequence_i(nums, k):
    n = len(nums)
    dp = [[None] * (k + 1) for _ in range(n)]
    best = 0
    for i in range(n):
        dp[i][0] = 1
        for c in range(k + 1):
            for j in range(i):
                cost = 1 if nums[j] != nums[i] else 0
                if c - cost >= 0 and dp[j][c - cost] is not None:
                    cand = dp[j][c - cost] + 1
                    if dp[i][c] is None or cand > dp[i][c]:
                        dp[i][c] = cand
        best = max([best] + [v for v in dp[i] if v is not None])
    return best
`
