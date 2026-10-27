export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k) || !Number.isInteger(obj.dist)) {
    throw new Error('Use {"nums": [...], "k": integer, "dist": integer}.')
  }
  const n = obj.nums.length
  if (n < 3 || n > 12) throw new Error('Use 3 to 12 numbers.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each number is an integer from 1 to 20.')
  if (obj.k < 3 || obj.k > n) throw new Error('k is an integer from 3 to the length of nums.')
  if (obj.dist < obj.k - 2 || obj.dist > n - 2) throw new Error('dist is an integer from k - 2 to n - 2.')
  return { nums: obj.nums, k: obj.k, dist: obj.dist }
}

export function buildTrace(input) {
  const { nums, k, dist } = input
  const n = nums.length
  let best = Infinity
  const frames = [{ phase: 'start', activeLine: L('set best to infinity'), s: null, window: [], picks: [], best: null, message: 'The first subarray always costs nums[0]. Choose the other k - 1 starts, all within dist of the first chosen one.' }]
  for (let s = 1; s <= n - 1; s++) {
    const end = Math.min(s + dist, n - 1)
    const window = nums.slice(s + 1, end + 1)
    let picks = []
    if (window.length >= k - 2) {
      picks = [...window].sort((a, b) => a - b).slice(0, k - 2)
      const candidate = nums[s] + picks.reduce((a, b) => a + b, 0)
      best = Math.min(best, candidate)
    }
    frames.push({ phase: 'scan', activeLine: L('for each start s'), s, window: [s + 1, end], picks, best: best === Infinity ? null : best, message: window.length >= k - 2 ? `Start ${s}: cheapest ${k - 2} values after it cost ${picks.reduce((a, b) => a + b, 0)}; best so far ${best}.` : `Start ${s}: not enough positions within dist.` })
  }
  const result = nums[0] + best
  frames.push({ phase: 'done', activeLine: L('return nums[0] + best'), s: null, window: [], picks: [], best: result, message: `Minimum total cost: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum cost of k subarrays whose starts are within dist:
  set best to infinity
  for each start s from 1 to n - 1:
    collect the values at positions s + 1 to min(s + dist, n - 1)
    if there are at least k - 2 of them then
      set candidate to nums[s] plus the k - 2 smallest collected values
      set best to the smaller of best and candidate
  return nums[0] + best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_divide(nums, k, dist):
    n = len(nums)
    best = float('inf')
    for s in range(1, n):
        window = sorted(nums[s + 1:min(s + dist, n - 1) + 1])
        if len(window) >= k - 2:
            best = min(best, nums[s] + sum(window[:k - 2]))
    return nums[0] + best
`
