export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 2 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 2 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each nums entry is an integer from 1 to 10.')
  return { nums: input.nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  const total = nums.reduce((sum, v) => sum + v, 0)
  let left = 0
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), index: -1, left: 0, right: total, count: 0, message: `Total ${total}. Splits run from index 0 to index ${n - 2}.` }]
  for (let i = 0; i <= n - 2; i++) {
    left += nums[i]
    const right = total - left
    const even = (left - right) % 2 === 0
    if (even) count++
    frames.push({ phase: 'split', activeLine: L('if left minus right is even'), index: i, left, right, count, even, message: `Split after ${i}: left ${left}, right ${right}, difference ${left - right} ${even ? 'is even' : 'is odd'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: n - 1, left, right: total - left, count, message: `Even-difference partitions: ${count}.` })
  return { input, result: count, frames }
}

export const code = `count partitions with an even sum difference
  set total to the sum of all numbers
  set left to 0 and count to 0
  for each split index i from 0 to n minus 2 do
    add nums[i] to left
    set right to total minus left
    if left minus right is even then add 1 to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_partitions(nums):
    total = sum(nums)
    left = 0
    count = 0
    for i in range(len(nums) - 1):
        left += nums[i]
        right = total - left
        if (left - right) % 2 == 0:
            count += 1
    return count
`
