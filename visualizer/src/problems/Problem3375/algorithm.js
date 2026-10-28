export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use {"nums": [...], "k": n} with 1 to 12 numbers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each number is an integer from 1 to 10.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 10) throw new Error('k is an integer from 1 to 10.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const frames = [{ phase: 'start', activeLine: L('if some value is below'), index: -1, count: 0, message: `Check whether every value is at least ${k}.` }]
  if (nums.some(v => v < k)) {
    frames.push({ phase: 'stuck', activeLine: L('return -1'), index: -1, count: -1, message: 'A value is below k, and operations only lower values, so k cannot be reached. The answer is -1.' })
    return { input, result: -1, frames }
  }
  const levels = [...new Set(nums.filter(v => v > k))].sort((a, b) => b - a)
  let operations = 0
  for (const level of levels) {
    operations += 1
    frames.push({ phase: 'level', activeLine: L('add 1 to operations'), index: nums.indexOf(level), count: operations, level, message: `Level ${level} is above k. One operation lowers the values above it to the next level down.` })
  }
  frames.push({ phase: 'done', activeLine: L('return operations'), index: -1, count: operations, message: `Minimum operations: ${operations}.` })
  return { input, result: operations, frames }
}

export const code = `minimum operations to make every value equal k
  if some value is below k then return -1
  set operations to 0
  for each distinct value above k, from largest to smallest
    add 1 to operations
  return operations`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_to_equal(nums, k):
    if min(nums) < k:
        return -1
    return len({x for x in nums if x > k})
`
