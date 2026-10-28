export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 2 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 2 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Each nums entry is an integer from -10 to 10.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  // lowest maps a value to the smallest prefix sum that starts an element with that value so far.
  const lowest = new Map()
  let prefix = 0
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set lowest to an empty map'), index: -1, prefix: 0, candidate: null, best: null, message: 'No starts have been recorded yet.' }]
  nums.forEach((value, j) => {
    if (!lowest.has(value) || prefix < lowest.get(value)) lowest.set(value, prefix)
    let candidate = null
    for (const target of [value - k, value + k]) {
      if (!lowest.has(target)) continue
      candidate = prefix + value - lowest.get(target)
      if (best === null || candidate > best) best = candidate
    }
    frames.push({ phase: 'scan', activeLine: L('if lowest has target'), index: j, prefix, candidate, best, message: candidate === null ? `No earlier start differs from ${value} by ${k}.` : `Best good subarray ending at ${j} sums to ${candidate}. Best so far ${best}.` })
    prefix += value
  })
  const result = best === null ? 0 : best
  frames.push({ phase: 'done', activeLine: L('return 0 if'), index: nums.length, prefix, candidate: null, best: result, message: `Maximum good subarray sum: ${result}.` })
  return { input, result, frames }
}

export const code = `maximum sum of a good subarray, where |nums[i] minus nums[j]| equals k
  set lowest to an empty map from value to prefix sum
  set prefix to 0 and best to nothing
  for each index j from 0 to n minus 1 do
    set lowest[nums[j]] to the smaller of its current value and prefix
    for each target in nums[j] minus k and nums[j] plus k do
      if lowest has target then the candidate is prefix plus nums[j] minus lowest[target]
      if best is nothing or the candidate is larger then update best
    add nums[j] to prefix
  return 0 if best is nothing, otherwise best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_good_subarray_sum(nums, k):
    lowest = {}
    best = None
    prefix = 0
    for value in nums:
        if value not in lowest or prefix < lowest[value]:
            lowest[value] = prefix
        for target in (value - k, value + k):
            if target in lowest:
                candidate = prefix + value - lowest[target]
                if best is None or candidate > best:
                    best = candidate
        prefix += value
    return 0 if best is None else best
`
