export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and x.')
  const { nums, x } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums must have 1 to 10 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each value must be an integer from 1 to 20.')
  if (!Number.isInteger(x) || x < 1 || x > 20) throw new Error('x must be an integer from 1 to 20.')
  return { nums, x }
}

export function buildTrace(input) {
  const { nums, x } = input
  const n = nums.length
  const best = Array(n).fill(null)
  best[0] = nums[0]
  const shown = () => [...best]
  const frames = [{ phase: 'start', activeLine: L('set best[0] to'), index: 0, from: -1, best: shown(), message: `Start at position 0 with score ${nums[0]}.` }]
  for (let i = 1; i < n; i++) {
    let top = -Infinity
    let from = -1
    for (let j = 0; j < i; j++) {
      const penalty = nums[j] % 2 !== nums[i] % 2 ? x : 0
      const score = best[j] - penalty + nums[i]
      if (score > top) { top = score; from = j }
    }
    best[i] = top
    frames.push({ phase: 'visit', activeLine: L('set top to the larger'), index: i, from, best: shown(), message: `Reach position ${i} best from ${from}: score ${top}.` })
  }
  const result = Math.max(...best)
  frames.push({ phase: 'done', activeLine: L('return the largest'), index: -1, from: -1, best: shown(), message: `Maximum score: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum score of visited positions (nums, x):
  set best[0] to nums[0]
  for each position i from 1 to n - 1:
    set top to nothing
    for each earlier position j from 0 to i - 1:
      set penalty to x if nums[j] and nums[i] have different parity, otherwise 0
      set top to the larger of top and best[j] - penalty + nums[i]
    set best[i] to top
  return the largest value in best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score(nums, x):
    n = len(nums)
    best = [0] * n
    best[0] = nums[0]
    for i in range(1, n):
        top = float('-inf')
        for j in range(i):
            penalty = x if nums[j] % 2 != nums[i] % 2 else 0
            top = max(top, best[j] - penalty + nums[i])
        best[i] = top
    return max(best)
`
