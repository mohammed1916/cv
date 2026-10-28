export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with nums, a and b.')
  const { nums, a, b } = obj
  if (nums.length < 1 || nums.length > 12) throw new Error('Use 1 to 12 numbers for the visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Each number must be an integer from 1 to 1000000000.')
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 1 || b < 1 || a > 1000000000 || b > 1000000000) throw new Error('a and b must be integers from 1 to 1000000000.')
  return { nums, a, b }
}

const lowerBound = (arr, v) => {
  let lo = 0
  let hi = arr.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] < v) lo = mid + 1
    else hi = mid
  }
  return lo
}

export function buildTrace(input) {
  const { nums, a, b } = input
  // score(prefix) = b * evens - a * odds. A subarray has x / y <= a / b exactly when its score change is at most 0.
  const seen = [0]
  const frames = []
  let score = 0
  let total = 0
  frames.push({ phase: 'start', activeLine: L('set total to 0'), index: -1, score, counted: 0, total, message: 'The empty prefix has score 0.' })
  nums.forEach((x, index) => {
    score += x % 2 === 0 ? b : -a
    const counted = seen.length - lowerBound(seen, score)
    total += counted
    seen.splice(lowerBound(seen, score), 0, score)
    frames.push({ phase: 'count', activeLine: L('count how many values in seen'), index, score, counted, total, message: `Prefix ${index + 1} has score ${score}; ${counted} earlier prefix${counted === 1 ? '' : 'es'} have a score at least that high.` })
  })
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, score, counted: 0, total, message: `Valid subarrays: ${total}.` })
  return { input, result: total, frames }
}

export const code = `count subarrays with even odd ratio(nums, a, b)
  set total to 0 and score to 0
  set seen to the list containing only 0
  for each number x in nums do
    if x is even then add b to score, otherwise subtract a from score
    count how many values in seen are at least score and add that to total
    insert score into seen
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `import bisect


def count_even_odd_ratio_subarrays(nums, a, b):
    seen = [0]
    score = 0
    total = 0
    for x in nums:
        score += b if x % 2 == 0 else -a
        total += len(seen) - bisect.bisect_left(seen, score)
        bisect.insort(seen, score)
    return total
`
