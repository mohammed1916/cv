export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array and an integer k.')
  const n = input.nums.length
  if (n < 1 || n > 20) throw new Error('nums needs 1 to 20 values.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('nums values are integers from 1 to 100.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > n) throw new Error('k must be an integer from 1 to n.')
  return input
}

export function buildTrace(input) {
  const { nums, k } = input
  const sorted = [...nums].sort((x, y) => x - y)
  const n = sorted.length
  const small = sorted.slice(0, k).reduce((sum, v) => sum + v, 0)
  const large = sorted.slice(n - k).reduce((sum, v) => sum + v, 0)
  const result = Math.abs(large - small)
  const frames = [{ phase: 'sort', activeLine: L('sort a copy'), small: null, large: null, message: 'Sort a copy of the numbers from smallest to largest.' }]
  frames.push({ phase: 'small', activeLine: L('small = sum of the first k'), small, large: null, message: `The k smallest values sum to ${small}.` })
  frames.push({ phase: 'large', activeLine: L('large = sum of the last k'), small, large, message: `The k largest values sum to ${large}.` })
  frames.push({ phase: 'done', activeLine: L('return the absolute value'), small, large, message: `|${large} - ${small}| = ${result}.` })
  return { input, result, frames, sorted }
}

export const code = `absolute difference of k largest and k smallest (nums, k):
  sort a copy of nums from smallest to largest
  small = sum of the first k values
  large = sum of the last k values
  return the absolute value of large minus small`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def absolute_difference_between_max_and_min_k_elements(nums, k):
    s = sorted(nums)
    return abs(sum(s[-k:]) - sum(s[:k]))
`
