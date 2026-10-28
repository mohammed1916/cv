export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use an array of 1 to 10 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Numbers are integers from -10 to 10.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  // A subsequence is balanced when nums[i] - i never decreases along it, so key[i] = nums[i] - i.
  const key = nums.map((v, i) => v - i)
  const best = nums.slice()
  const frames = [{ phase: 'start', activeLine: L('set best[i] to nums[i]'), i: 0, j: null, best: [...best], key, message: 'Each index alone is a balanced subsequence, so start each best value at nums[i].' }]
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (key[j] <= key[i]) best[i] = Math.max(best[i], best[j] + nums[i])
    }
    frames.push({ phase: 'index', activeLine: L('keep the larger'), i, j: null, best: [...best], key, message: `Best balanced sum ending at index ${i} is ${best[i]} (key ${key[i]}).` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', activeLine: L('return the largest value'), i: n - 1, j: null, best: [...best], key, message: `The largest balanced subsequence sum is ${result}.` })
  return { input: nums, result, frames, key }
}

export const code = `largest balanced subsequence sum:
  for each index i, set key[i] to nums[i] - i
  set best[i] to nums[i] for every index i
  for each index i from 1 to n-1:
    for each earlier index j with key[j] at most key[i]:
      keep the larger of best[i] and best[j] + nums[i] in best[i]
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_balanced_sum(nums):
    n = len(nums)
    key = [nums[i] - i for i in range(n)]
    best = nums[:]
    for i in range(1, n):
        for j in range(i):
            if key[j] <= key[i]:
                best[i] = max(best[i], best[j] + nums[i])
    return max(best)
`
