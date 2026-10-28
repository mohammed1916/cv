export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 integers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each nums entry is an integer from 1 to 20.')
  return { nums: input.nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const total = nums.reduce((sum, value) => sum + value, 0)
  const answer = []
  let left = 0
  const frames = [{ phase: 'start', activeLine: L('set total to the sum'), index: -1, left: 0, right: total, answer: [], message: `Total sum is ${total}. Nothing lies to the left of index 0.` }]
  nums.forEach((value, i) => {
    const right = total - left - value
    answer.push(Math.abs(left - right))
    frames.push({ phase: 'scan', activeLine: L('add the difference'), index: i, left, right, answer: [...answer], message: `Index ${i}: left ${left}, right ${right}, difference ${Math.abs(left - right)}.` })
    left += value
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), index: nums.length, left, right: 0, answer: [...answer], message: `Answer: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `left and right sum differences of an array
  set total to the sum of all numbers
  set left to 0 and answer to an empty list
  for each index i in order do
    set right to total minus left minus nums[i]
    add the difference between left and right to answer
    add nums[i] to left
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def left_right_sum_differences(nums):
    total = sum(nums)
    left = 0
    answer = []
    for value in nums:
        right = total - left - value
        answer.append(abs(left - right))
        left += value
    return answer
`
