export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 0 || v > 3)) throw new Error('Each nums entry is an integer from 0 to 3.')
  if (!Number.isInteger(input.target) || input.target < 0 || input.target > 3) throw new Error('target is an integer from 0 to 3.')
  return { nums: input.nums, target: input.target }
}

export function buildTrace(input) {
  const { nums, target } = input
  const n = nums.length
  // prefix[j] is the sum of the first j values, with +1 for target and -1 otherwise.
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + (v === target ? 1 : -1))
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set prefix[0] to 0'), index: -1, count: 0, end: null, prefix: [...prefix], message: 'The empty prefix has balance 0.' }]
  for (let j = 1; j <= n; j++) {
    let added = 0
    for (let i = 0; i < j; i++) if (prefix[i] < prefix[j]) added++
    count += added
    frames.push({ phase: 'end', activeLine: L('count the earlier prefixes'), index: j - 1, count, end: j, added, prefix: [...prefix], message: `Subarrays ending at ${j - 1} with target as majority: ${added}. Total ${count}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: n, count, end: null, added: 0, prefix: [...prefix], message: `Subarrays with target as majority: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count subarrays where target is the strict majority
  set prefix[0] to 0
  for each index j from 0 to n minus 1 do
    set prefix[j + 1] to prefix[j] plus 1 if nums[j] equals target, otherwise minus 1
  set count to 0
  for each end e from 1 to n do
    count the earlier prefixes i below e with prefix[i] less than prefix[e], and add them to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_majority_subarrays(nums, target):
    prefix = [0]
    for v in nums:
        prefix.append(prefix[-1] + (1 if v == target else -1))
    count = 0
    for e in range(1, len(prefix)):
        count += sum(1 for i in range(e) if prefix[i] < prefix[e])
    return count
`
