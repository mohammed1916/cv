export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || !nums.length || nums.length > 100 || nums.some(n => !Number.isInteger(n) || n < 1 || n > 100)) {
    throw new Error('Enter a JSON array of 1–100 integers, each between 1 and 100.')
  }
  return nums
}

export function buildTrace(nums) {
  const left = [], right = [], selected = [], result = []
  const frames = [{ phase: 'start', index: -1, activeLine: 2, message: 'An element needs to beat every value on either side, not necessarily both.' }]
  let maximum = 0
  nums.forEach((value, index) => {
    left[index] = maximum
    frames.push({ phase: 'left', index, maximum, activeLine: 5,
      message: `Left scan at ${index}: ${value} ${value > maximum ? 'beats' : 'does not beat'} the preceding maximum ${maximum || '(empty side)'}.` })
    maximum = Math.max(maximum, value)
  })
  maximum = 0
  for (let index = nums.length - 1; index >= 0; index--) {
    right[index] = maximum
    frames.push({ phase: 'right', index, maximum, activeLine: 9,
      message: `Right scan at ${index}: ${nums[index]} ${nums[index] > maximum ? 'beats' : 'does not beat'} the following maximum ${maximum || '(empty side)'}.` })
    maximum = Math.max(maximum, nums[index])
  }
  nums.forEach((value, index) => {
    selected[index] = value > left[index] || value > right[index]
    if (selected[index]) result.push(value)
    frames.push({ phase: 'select', index, activeLine: 11, accepted: selected[index],
      message: `${selected[index] ? 'Keep' : 'Reject'} index ${index}: ${value} > ${left[index]} OR ${value} > ${right[index]}. Equality does not qualify.` })
  })
  frames.push({ phase: 'done', index: -1, activeLine: 11, message: 'Return valid elements in original order, preserving duplicates at different indices.' })
  return { input: [...nums], left, right, selected, result, frames }
}

export const code = `def validElements(nums):
    left, right = [0] * len(nums), [0] * len(nums)
    maximum = 0
    for i, value in enumerate(nums):
        left[i] = maximum
        maximum = max(maximum, value)
    maximum = 0
    for i in range(len(nums) - 1, -1, -1):
        right[i] = maximum
        maximum = max(maximum, nums[i])
    return [v for i, v in enumerate(nums) if v > left[i] or v > right[i]]`
  .split('\n').map((text, index) => ({ line: index + 1, text }))
