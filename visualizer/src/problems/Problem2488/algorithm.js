export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums must have 1 to 12 entries.')
  const n = nums.length
  if (!nums.every(v => Number.isInteger(v)) || new Set(nums).size !== n || nums.some(v => v < 1 || v > n)) throw new Error('nums must be a permutation of the integers 1 to n.')
  if (!Number.isInteger(k) || k < 1 || k > n) throw new Error('k must be an integer from 1 to n.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to 0'), left: -1, right: -1, count, message: `Count subarrays whose median is ${k}.` }]
  for (let left = 0; left < n; left++) {
    for (let right = left; right < n; right++) {
      const sorted = nums.slice(left, right + 1).sort((a, b) => a - b)
      const median = sorted[Math.floor(sorted.length / 2)]
      const hit = median === k
      if (hit) count++
      frames.push({ phase: 'check', activeLine: L('if the median'), left, right, count, message: `Subarray [${left}..${right}] sorts to [${sorted.join(', ')}] with median ${median}${hit ? ', so it counts' : ''}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), left: -1, right: -1, count, message: `${count} subarrays have median ${k}.` })
  return { input, result: count, frames }
}

export const code = `count subarrays with median k (nums, k):
  set count to 0
  for each start index left:
    for each end index right from left onward:
      copy nums from left to right and sort the copy
      take the element at index floor(length / 2) as the median
      if the median equals k then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_subarrays_with_median_k(nums, k):
    count = 0
    n = len(nums)
    for left in range(n):
        for right in range(left, n):
            window = sorted(nums[left:right + 1])
            if window[len(window) // 2] == k:
                count += 1
    return count
`
