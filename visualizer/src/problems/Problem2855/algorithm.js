export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be JSON, for example {"nums":[3,4,5,1,2]}.')
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with a nums array.')
  const nums = data.nums
  if (nums.length < 1 || nums.length > 100) throw new Error('nums must have 1 to 100 elements.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each value must be an integer from 1 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('The values in nums must be distinct.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  const frames = []
  const breaks = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, cursor: -1, breaks: [...breaks], result: null, ...extra,
  })

  push('setup', 2, 2, `There are ${n} elements, so the last index is ${n - 1}.`)
  for (let i = 0; i < n - 1; i++) {
    const descent = nums[i] > nums[i + 1]
    if (descent) breaks.push(i)
    push('scan', 3, 3, `Compare nums[${i}] = ${nums[i]} with nums[${i + 1}] = ${nums[i + 1]}. ${descent ? 'It is a descent.' : 'Still ascending.'}`, { cursor: i })
  }
  if (breaks.length === 0) {
    push('done', 4, 4, 'The array has no descent, so it is already sorted.', { result: 0 })
    push('done', 4, 5, 'Return 0 right shifts.', { result: 0 })
    return { input, result: 0, frames }
  }
  push('check', 5, 6, `There are ${breaks.length} descent(s). Check whether the wrap-around is valid.`)
  if (breaks.length > 1 || nums[n - 1] > nums[0]) {
    push('done', 5, 7, breaks.length > 1 ? 'More than one descent, so a rotation cannot sort the array.' : `The last value ${nums[n - 1]} is greater than the first value ${nums[0]}, so the wrap-around breaks order.`, { result: -1 })
    push('done', 5, 7, 'Return -1.', { result: -1 })
    return { input, result: -1, frames }
  }
  const result = n - 1 - breaks[0]
  push('done', 6, 8, `Shift right ${result} time(s) to bring the smallest element to the front.`, { result })
  return { input, result, frames }
}

export const code = `minimum right shifts to sort nums
  set n to the length of nums
  find every index i where nums[i] is greater than nums[i + 1]
  if there are no such indexes then return 0
  if there are two or more, or the last value is greater than the first, return -1
  return n - 1 - the index of the single descent`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def minimumRightShifts(nums):
    n = len(nums)
    breaks = [i for i in range(n - 1) if nums[i] > nums[i + 1]]
    if not breaks:
        return 0
    if len(breaks) > 1 or nums[-1] > nums[0]:
        return -1
    return n - 1 - breaks[0]
`
