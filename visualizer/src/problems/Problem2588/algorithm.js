export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums must have 1 to 20 entries (visualization cap).')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 255)) throw new Error('Each value is an integer from 0 to 255 (visualization cap).')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  let prefix = 0
  const seen = new Map([[0, 1]])
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set prefix to 0'), index: -1, prefix, count, message: 'Start with prefix 0, seen once at the empty prefix.' }]
  nums.forEach((value, index) => {
    prefix ^= value
    const pairs = seen.get(prefix) ?? 0
    count += pairs
    seen.set(prefix, pairs + 1)
    frames.push({ phase: 'step', activeLine: L('add seen'), index, prefix, count, message: `After value ${value}, prefix is ${prefix}. ${pairs} earlier prefix(es) match, so the count is ${count}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return count'), index: nums.length, prefix, count, message: `Beautiful subarrays: ${count}.` })
  return { input, nums, result: count, frames }
}

export const code = `count beautiful subarrays of nums
  set prefix to 0
  set seen so that seen[0] is 1
  set count to 0
  for each value in nums do
    prefix = prefix xor value
    add seen[prefix] to count
    increase seen[prefix] by 1
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_beautiful_subarrays(nums):
    prefix = 0
    seen = {0: 1}
    count = 0
    for value in nums:
        prefix ^= value
        count += seen.get(prefix, 0)
        seen[prefix] = seen.get(prefix, 0) + 1
    return count
`
