export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 10) throw new Error('Use {"nums": [...]} with 1 to 10 numbers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < -2000 || v > 2000)) throw new Error('Numbers are integers from -2000 to 2000.')
  if (input.nums.some((v, i) => i > 0 && v < input.nums[i - 1])) throw new Error('nums must be sorted in non-decreasing order.')
  return { nums: input.nums }
}

// Number of entries strictly below x (lower bound), in a sorted list.
const countBelow = (list, x) => {
  let lo = 0
  let hi = list.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (list[mid] < x) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace({ nums }) {
  const frames = [{ phase: 'start', activeLine: L('find the first index that is not negative'), negative: null, positive: null, message: 'The array is sorted, so the sign boundaries can be searched.' }]
  const negative = countBelow(nums, 0)
  frames.push({ phase: 'negative', activeLine: L('negatives are the values before'), negative, positive: null, message: `${negative} negative value${negative === 1 ? '' : 's'} sit before index ${negative}.` })
  const positive = nums.length - countBelow(nums.map(v => (v <= 0 ? 0 : 1)), 1)
  frames.push({ phase: 'positive', activeLine: L('positives are the values from'), negative, positive, message: `${positive} positive value${positive === 1 ? '' : 's'} sit after the zeros.` })
  const result = Math.max(negative, positive)
  frames.push({ phase: 'done', activeLine: L('return the larger count'), negative, positive, message: `The larger count is ${result}.` })
  return { input: { nums }, result, frames }
}

export const code = `larger of the positive count and the negative count in a sorted array
  find the first index that is not negative
  negatives are the values before that index
  find the first index that is above zero
  positives are the values from that index to the end
  return the larger count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_count(nums):
    import bisect
    negatives = bisect.bisect_left(nums, 0)
    positives = len(nums) - bisect.bisect_right(nums, 0)
    return max(negatives, positives)
`
