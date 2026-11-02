export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 50 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Use a JSON array of 1 to 50 integers from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const seen = new Set(nums)
  let total = nums[0]
  let end = 0
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('total = first value'), at: 0, end, total, x: null, message: `The sequential prefix starts with ${nums[0]}.` })
  while (end + 1 < nums.length && nums[end + 1] === nums[end] + 1) {
    end += 1
    total += nums[end]
    frames.push({ pythonLine: 6, phase: 'extend', activeLine: L('move end forward and add'), at: end, end, total, x: null, message: `${nums[end]} continues the run; total is ${total}.` })
  }
  frames.push({ pythonLine: 7, phase: 'set', activeLine: L('seen = set of all values'), at: end, end, total, x: total, message: `The run stops at index ${end}. Start searching from ${total}.` })
  let x = total
  while (seen.has(x)) {
    frames.push({ pythonLine: 10, phase: 'skip', activeLine: L('x = x + 1'), at: -1, end, total, x, message: `${x} is present, so try ${x + 1}.` })
    x += 1
  }
  frames.push({ pythonLine: 11, phase: 'done', activeLine: L('return x'), at: -1, end, total, x, message: `${x} is missing and is the answer.` })
  return { input: nums, result: x, frames }
}

export const code = `smallest missing integer after the sequential prefix sum
  total = first value; end = 0
  while the next value is one more than the previous value
    move end forward and add that value to total
  seen = set of all values
  x = total
  while x is in seen
    x = x + 1
  return x`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_missing(nums):
    total = nums[0]
    end = 0
    while end + 1 < len(nums) and nums[end + 1] == nums[end] + 1:
        end += 1
        total += nums[end]
    seen = set(nums)
    x = total
    while x in seen:
        x += 1
    return x
`
