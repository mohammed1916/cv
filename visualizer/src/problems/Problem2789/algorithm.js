export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.nums)) throw new Error('Use an object with an array key nums.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums has 1 to 20 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums entries are integers from 1 to 1000.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  let current = nums[n - 1]
  let best = current
  const frames = [{ phase: 'start', activeLine: L('set current to the last value'), index: n - 1, current, best, message: `Start from the last value ${current}.` }]
  for (let i = n - 2; i >= 0; i--) {
    const merged = nums[i] <= current
    if (merged) current += nums[i]
    else current = nums[i]
    if (current > best) best = current
    frames.push({ phase: 'scan', activeLine: L('if nums[i] is at most current'), index: i, current, best, merged, message: merged ? `${nums[i]} is at most the block to its right, so it merges in. Block value ${current}.` : `${nums[i]} is larger, so a new block starts here. Block value ${current}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, current, best, message: `Largest element: ${best}.` })
  return { input, result: best, frames }
}

export const code = `largest element after merge operations
  set current to the last value
  set best to current
  for i from the second last index back to the first
    if nums[i] is at most current then
      set current to nums[i] plus current
    otherwise
      set current to nums[i]
    if current is above best then
      set best to current
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_after_merge(nums):
    current = nums[-1]
    best = current
    for i in range(len(nums) - 2, -1, -1):
        if nums[i] <= current:
            current += nums[i]
        else:
            current = nums[i]
        best = max(best, current)
    return best
`
