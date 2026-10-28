export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 40) throw new Error('Use an array of 2 to 40 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each number is an integer from 1 to 1000.')
  return nums
}

export function buildTrace(nums) {
  const target = nums[0] + nums[1]
  const frames = [{ phase: 'start', activeLine: L('set target'), index: 0, used: 0, count: 0, message: `The first two numbers sum to ${target}, so every operation must score ${target}.` }]
  let count = 0
  let i = 0
  while (i + 1 < nums.length) {
    const sum = nums[i] + nums[i + 1]
    if (sum !== target) {
      frames.push({ phase: 'stop', activeLine: L('if their sum'), index: i, used: i, count, message: `The pair ${nums[i]} + ${nums[i + 1]} = ${sum} is not ${target}, so stop.` })
      break
    }
    count += 1
    i += 2
    frames.push({ phase: 'pair', activeLine: L('count one'), index: i - 1, used: i, count, message: `This pair sums to ${target}. Operations so far: ${count}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: -1, used: i, count, message: `Maximum operations with score ${target}: ${count}.` })
  return { input: nums, result: count, frames }
}

export const code = `maximum operations with one score
  set target to the sum of the first two numbers
  set count to 0
  set i to 0
  repeat while two numbers remain at i and i plus 1
    if their sum is not target then stop
    count one operation and move i forward by two
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_operations(nums):
    if len(nums) < 2:
        return 0
    target = nums[0] + nums[1]
    count = 0
    i = 0
    while i + 1 < len(nums):
        if nums[i] + nums[i + 1] != target:
            break
        count += 1
        i += 2
    return count
`
