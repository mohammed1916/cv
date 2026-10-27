export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with nums (an array).')
  const { nums } = data
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums needs 1 to 12 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 8)) throw new Error('Each number is an integer from 1 to 8.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const total = (n * (n + 1)) / 2
  // The median is the element at index floor((total - 1) / 2) of the sorted uniqueness array.
  const target = Math.floor((total + 1) / 2)
  // Count subarrays with at most `limit` distinct numbers with a sliding window.
  const atMost = limit => {
    const counts = new Map()
    let distinct = 0
    let left = 0
    let result = 0
    for (let right = 0; right < n; right++) {
      const value = nums[right]
      counts.set(value, (counts.get(value) || 0) + 1)
      if (counts.get(value) === 1) distinct++
      while (distinct > limit) {
        const out = nums[left]
        counts.set(out, counts.get(out) - 1)
        if (counts.get(out) === 0) distinct--
        left++
      }
      result += right - left + 1
    }
    return result
  }
  let lo = 1
  let hi = new Set(nums).size
  const domain = [lo, hi]
  const frames = [{ phase: 'start', activeLine: L('set low to 1'), lo, hi, mid: null, verdict: null, count: null, target, message: `There are ${total} subarrays; the median needs ${target} of them to have at most the answer in distinct numbers.` }]
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const seen = atMost(mid)
    const verdict = seen >= target
    frames.push({ phase: 'probe', activeLine: L('if at least target subarrays have at most mid distinct'), lo, hi, mid, verdict, count: seen, target, message: `Limit ${mid}: ${seen} subarrays have at most ${mid} distinct numbers, ${verdict ? 'enough' : 'not enough'} for ${target}.` })
    if (verdict) hi = mid
    else lo = mid + 1
  }
  frames.push({ phase: 'done', activeLine: L('return low'), lo, hi: lo, mid: null, verdict: null, count: atMost(lo), target, message: `Median of the uniqueness array: ${lo}.` })
  return { input: { nums }, domain, result: lo, frames }
}

export const code = `median of the uniqueness array of nums
  set total to the number of subarrays, n times n plus one, divided by two
  set target to the middle position of the sorted uniqueness array, plus one
  set low to 1 and high to the number of distinct values in nums
  while low is less than high
    set mid to the middle value, rounded down
    if at least target subarrays have at most mid distinct values then
      set high to mid
    else
      set low to mid plus 1
  return low

count of subarrays with at most a limit of distinct values
  move the right end across nums and add each value to a count
  while the window has more than the limit distinct values
    move the left end forward and remove its value
  add the number of valid starts for this right end
  return the total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def median_of_uniqueness_array(nums):
    n = len(nums)
    total = n * (n + 1) // 2
    target = (total + 1) // 2

    def at_most(limit):
        counts = {}
        distinct = 0
        left = 0
        result = 0
        for right, value in enumerate(nums):
            counts[value] = counts.get(value, 0) + 1
            if counts[value] == 1:
                distinct += 1
            while distinct > limit:
                out = nums[left]
                counts[out] -= 1
                if counts[out] == 0:
                    distinct -= 1
                left += 1
            result += right - left + 1
        return result

    low, high = 1, len(set(nums))
    while low < high:
        mid = (low + high) // 2
        if at_most(mid) >= target:
            high = mid
        else:
            low = mid + 1
    return low
`
