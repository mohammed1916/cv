export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30) throw new Error('nums must be an array of 2 to 30 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('Each nums value is an integer from 1 to 1000.')
  if (!Number.isInteger(k) || k < 1 || k > Math.floor(nums.length / 2)) throw new Error('k must be an integer from 1 to floor(length / 2).')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const n = nums.length
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total to 0'), index: -1, good: null, total, message: `Check each index. An index is good when it beats the value k steps to each side that exists.` }]
  for (let i = 0; i < n; i++) {
    const left = i - k >= 0 ? nums[i - k] : null
    const right = i + k < n ? nums[i + k] : null
    const beatsLeft = left === null || nums[i] > left
    const beatsRight = right === null || nums[i] > right
    const good = beatsLeft && beatsRight
    frames.push({ phase: 'check', activeLine: L('if the value beats'), index: i, good, total, message: `Index ${i} (value ${nums[i]}) ${good ? 'is good' : 'is not good'}; its partners are ${left === null ? 'missing' : left} and ${right === null ? 'missing' : right}.` })
    if (good) {
      total += nums[i]
      frames.push({ phase: 'add', activeLine: L('add the value'), index: i, good, total, message: `Add ${nums[i]}. Total is now ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, good: null, total, message: `Sum of good numbers: ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of good numbers for nums and k:
  set total to 0
  for each index i in nums:
    find the value k steps to the left, if it exists
    find the value k steps to the right, if it exists
    if the value beats every existing partner then
      add the value to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_good_numbers(nums, k):
    total = 0
    for i in range(len(nums)):
        left = nums[i - k] if i - k >= 0 else None
        right = nums[i + k] if i + k < len(nums) else None
        beats_left = left is None or nums[i] > left
        beats_right = right is None or nums[i] > right
        if beats_left and beats_right:
            total += nums[i]
    return total
`
