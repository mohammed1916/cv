export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 2000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000)) throw new Error('Enter a JSON array of 1–2,000 integers with |v| ≤ 1,000,000.')
  return nums
}

// length[i] and count[i]: the longest increasing subsequence ending at i and how many realize that length.
export function buildTrace(nums) {
  const n = nums.length
  const length = Array(n).fill(1), count = Array(n).fill(1)
  const frames = [{ phase: 'start', i: -1, j: -1, length: [...length], count: [...count], activeLine: 2, message: 'Every single element is an increasing subsequence of length 1.' }]
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) {
    if (nums[j] >= nums[i]) continue
    if (length[j] + 1 > length[i]) { length[i] = length[j] + 1; count[i] = count[j] }
    else if (length[j] + 1 === length[i]) count[i] += count[j]
    frames.push({ phase: 'extend', i, j, length: [...length], count: [...count], activeLine: 7, message: `${nums[j]} < ${nums[i]}: from ${j}, length ${length[j] + 1}; ending at ${i}: length ${length[i]}, count ${count[i]}.` })
  }
  const best = Math.max(...length)
  const result = length.reduce((sum, len, i) => (len === best ? sum + count[i] : sum), 0)
  frames.push({ phase: 'done', i: -1, j: -1, length: [...length], count: [...count], result, activeLine: 10, message: `${result} longest increasing subsequences of length ${best}.` })
  return { input: nums, result, frames }
}

export const code = `def findNumberOfLIS(nums):
    n = len(nums)
    length, count = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if length[j] + 1 > length[i]: length[i], count[i] = length[j] + 1, count[j]
                elif length[j] + 1 == length[i]: count[i] += count[j]
    best = max(length)
    return sum(c for l, c in zip(length, count) if l == best)`.split('\n').map((text, index) => ({ line: index + 1, text }))
