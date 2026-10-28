export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array and an integer k.')
  const n = input.nums.length
  if (n < 1 || n > 20) throw new Error('nums needs 1 to 20 values.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums values are integers from 1 to 1000.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > n) throw new Error('k must be an integer from 1 to n.')
  return input
}

// Counts pairs i < j with a larger value first, by comparing every pair in the window.
const countInversions = w => {
  let count = 0
  for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++) if (w[i] > w[j]) count++
  return count
}

export function buildTrace(input) {
  const { nums, k } = input
  let best = null
  const frames = [{ phase: 'start', activeLine: L('best = nothing'), start: -1, count: null, best, message: `Slide a window of length ${k} across the array.` }]
  for (let s = 0; s + k <= nums.length; s++) {
    const count = countInversions(nums.slice(s, s + k))
    if (best === null || count < best) best = count
    frames.push({ phase: 'window', activeLine: L('count = number of pairs'), start: s, count, best, message: `Window starting at index ${s} has ${count} inversions. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, count: null, best, message: `Minimum inversion count: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum inversion count in fixed windows (nums, k):
  best = nothing
  for each window start s from 0 to n - k
    count = number of pairs i < j in the window with a larger value first
    if best is unset or count is less than best then
      set best to count
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_inversion_count(nums, k):
    best = None
    for s in range(len(nums) - k + 1):
        window = nums[s:s + k]
        count = 0
        for i in range(k):
            for j in range(i + 1, k):
                if window[i] > window[j]:
                    count += 1
        if best is None or count < best:
            best = count
    return best
`
