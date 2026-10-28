export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a nums key.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums needs 1 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < -10 || v > 10)) throw new Error('Values are integers from -10 to 10.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const order = nums.map((_, i) => i).sort((a, b) => nums[b] - nums[a] || a - b)
  let total = 0
  let score = 0
  const frames = [{ phase: 'start', activeLine: L('sort the numbers'), index: -1, total, score, message: 'Sort the numbers from largest to smallest.' }]
  for (const i of order) {
    total += nums[i]
    if (total > 0) score += 1
    frames.push({ phase: total > 0 ? 'count' : 'add', activeLine: L('add the number to total'), index: i, total, score, message: `Add ${nums[i]}; prefix sum ${total} ${total > 0 ? 'is positive' : 'is not positive'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return score'), index: -1, total, score, message: `${score} prefix sums are positive.` })
  return { input, result: score, frames }
}

export const code = `maximum number of positive prefix sums:
  sort the numbers from largest to smallest
  set total to 0 and score to 0
  for each number in that order
    add the number to total
    if total is greater than 0 then add one to score
  return score`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def rearrange_for_prefix_score(nums):
    total = 0
    score = 0
    for value in sorted(nums, reverse=True):
        total += value
        if total > 0:
            score += 1
    return score
`
