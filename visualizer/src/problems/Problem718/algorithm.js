export function parseInput(text) {
  const data = JSON.parse(text)
  const { nums1, nums2 } = data ?? {}
  const ok = a => Array.isArray(a) && a.length >= 1 && a.length <= 60 && a.every(v => Number.isInteger(v) && v >= 0 && v <= 100)
  if (!ok(nums1) || !ok(nums2)) throw new Error('nums1 and nums2 must be arrays of 1–60 integers from 0 to 100.')
  return { nums1, nums2 }
}

// dp[i][j] = length of the longest common subarray ending at nums1[i−1] and nums2[j−1].
export function buildTrace({ nums1, nums2 }) {
  const n = nums1.length, m = nums2.length
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  let best = 0, bestEnd = [0, 0]
  const frames = [{ phase: 'start', row: 0, column: 0, table: dp.map(r => [...r]), best, activeLine: 2, message: 'Zero-length matches before the first elements.' }]
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    if (nums1[i - 1] === nums2[j - 1]) {
      dp[i][j] = dp[i - 1][j - 1] + 1
      if (dp[i][j] > best) { best = dp[i][j]; bestEnd = [i, j] }
    }
    frames.push({ phase: nums1[i - 1] === nums2[j - 1] ? 'match' : 'mismatch', row: i, column: j, table: dp.map(r => [...r]), best, activeLine: nums1[i - 1] === nums2[j - 1] ? 6 : 8,
      message: nums1[i - 1] === nums2[j - 1] ? `${nums1[i - 1]} = ${nums2[j - 1]}: extend the run to ${dp[i][j]}.` : `${nums1[i - 1]} ≠ ${nums2[j - 1]}: the run resets to 0.` })
  }
  frames.push({ phase: 'done', row: bestEnd[0], column: bestEnd[1], table: dp.map(r => [...r]), best, result: best, activeLine: 10, message: `Longest common subarray: ${best}.` })
  return { input: { nums1, nums2 }, result: best, frames }
}

export const code = `def findLength(nums1, nums2):
    dp = [[0] * (len(nums2) + 1) for _ in range(len(nums1) + 1)]
    best = 0
    for i in range(1, len(nums1) + 1):
        for j in range(1, len(nums2) + 1):
            if nums1[i - 1] == nums2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
                best = max(best, dp[i][j])
    return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
