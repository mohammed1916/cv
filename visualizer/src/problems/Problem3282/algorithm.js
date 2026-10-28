export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30) throw new Error('Use an array of 2 to 30 numbers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each number is an integer from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const frames = [{ phase: 'start', activeLine: L('set best to the first'), index: 0, bestIndex: 0, best: nums[0], total: 0, message: 'A jump from i to j scores (j - i) times the value at i, so each position pays for the largest value seen so far.' }]
  let best = nums[0]
  let bestIndex = 0
  let total = 0
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] > best) {
      best = nums[i]
      bestIndex = i
    }
    total += best
    frames.push({ phase: 'step', activeLine: L('add best to total'), index: i, bestIndex, best, total, message: `Position ${i} pays the current largest value ${best}. Score so far: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, bestIndex, best, total, message: `Maximum score: ${total}.` })
  return { input: nums, result: total, frames }
}

export const code = `maximum score to reach the last index
  set best to the first number
  set total to 0
  for each index from 0 to the second-to-last
    set best to the larger of best and this number
    add best to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_score(nums):
    best = nums[0]
    total = 0
    for x in nums[:-1]:
        best = max(best, x)
        total += best
    return total
`
