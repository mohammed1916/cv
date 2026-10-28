export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use a JSON object with a nums array.')
  if (input.nums.length < 3 || input.nums.length > 20) throw new Error('nums needs 3 to 20 values.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums values are integers from 1 to 1000.')
  return input
}

export function buildTrace(input) {
  const { nums } = input
  const groups = [0, 1, 2].map(r => nums.filter(x => x % 3 === r).sort((a, b) => b - a))
  let best = 0
  const frames = [{ phase: 'split', activeLine: L('split the numbers into three groups'), groups, best, message: `Groups by remainder: ${groups.map((g, r) => `remainder ${r} [${g.join(', ')}]`).join('; ')}.` }]
  if (groups.every(g => g.length > 0)) {
    const sum = groups[0][0] + groups[1][0] + groups[2][0]
    best = Math.max(best, sum)
    frames.push({ phase: 'pick', activeLine: L('the sum of the top of each group'), groups, best, message: `One number from each remainder class sums to ${sum}.` })
  }
  for (let r = 0; r < 3; r++) {
    if (groups[r].length >= 3) {
      const sum = groups[r][0] + groups[r][1] + groups[r][2]
      best = Math.max(best, sum)
      frames.push({ phase: 'pick', activeLine: L('its top three numbers'), groups, best, message: `The top three of remainder ${r} sum to ${sum}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), groups, best, message: `Largest valid sum: ${best}.` })
  return { input, result: best, frames, groups }
}

export const code = `maximum sum of three divisible by three (nums):
  split the numbers into three groups by remainder mod 3
  sort each group from largest to smallest
  best = 0
  if all three groups are non-empty then
    best = the largest of best and the sum of the top of each group
  for each group with at least three numbers
    best = the largest of best and the sum of its top three numbers
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_sum_of_three_numbers_divisible_by_three(nums):
    groups = [sorted((x for x in nums if x % 3 == r), reverse=True) for r in range(3)]
    best = 0
    if all(groups):
        best = max(best, groups[0][0] + groups[1][0] + groups[2][0])
    for g in groups:
        if len(g) >= 3:
            best = max(best, g[0] + g[1] + g[2])
    return best
`
