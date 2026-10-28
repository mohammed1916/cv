export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a nums array.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12) throw new Error('nums must have 2 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('nums values are integers from -100 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const total = nums.reduce((a, b) => a + b, 0)
  let left = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set left to 0'), index: -1, left: 0, right: total, count: 0, message: `Total is ${total}. Try each split point.` }]
  for (let i = 0; i < nums.length - 1; i++) {
    left += nums[i]
    const right = total - left
    const ok = left >= right
    if (ok) count += 1
    frames.push({ phase: 'split', activeLine: L('if left is at least the right'), index: i, left, right, count, ok, message: `Split after index ${i}: left ${left}, right ${right}. ${ok ? 'Counts.' : 'Too small.'}` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: -1, left: total, right: 0, count, message: `${count} valid splits.` })
  return { input, result: count, frames }
}

export const code = `number of ways to split array (nums):
  set total to the sum of nums
  set left to 0
  set count to 0
  for each index i from 0 to the second last index
    add nums at i to left
    set right to total minus left
    if left is at least the right then
      add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def ways_to_split(nums):
    total = sum(nums)
    left = 0
    count = 0
    for i in range(len(nums) - 1):
        left += nums[i]
        right = total - left
        if left >= right:
            count += 1
    return count
`
