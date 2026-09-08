export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 100000 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) {
    throw new Error('Enter a JSON array of 3–100,000 integers, each between 1 and 1,000,000,000.')
  }
  let descending = false
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1] || descending && nums[i] > nums[i - 1]) throw new Error('Use a single peak: no equal neighbors or upward turn after descending.')
    if (nums[i] < nums[i - 1]) descending = true
  }
  return nums
}

export function buildTrace(nums) {
  let peak = 0, left = 0, right = 0
  const frames = [{ phase: 'start', index: -1, peak: null, left, right, activeLine: 2, message: 'Locate the peak, then sum both inclusive parts. The peak belongs to both.' }]
  while (peak + 1 < nums.length && nums[peak] < nums[peak + 1]) {
    frames.push({ phase: 'scan', index: peak, peak: null, left, right, activeLine: 3, message: `${nums[peak]} < ${nums[peak + 1]}: the peak lies further right.` })
    peak++
  }
  frames.push({ phase: 'peak', index: peak, peak, left, right, activeLine: 5,
    message: `Peak at index ${peak}, value ${nums[peak]}. Ascending range [0..${peak}], descending range [${peak}..${nums.length - 1}].` })
  for (let i = 0; i <= peak; i++) {
    left += nums[i]
    frames.push({ phase: 'left', index: i, peak, left, right, activeLine: 7, message: `Add nums[${i}]=${nums[i]} to the ascending sum: ${left}.${i === peak ? ' Include the peak.' : ''}` })
  }
  for (let i = peak; i < nums.length; i++) {
    right += nums[i]
    frames.push({ phase: 'right', index: i, peak, left, right, activeLine: 9, message: `Add nums[${i}]=${nums[i]} to the descending sum: ${right}.${i === peak ? ' Include the same peak again in this separate sum.' : ''}` })
  }
  const result = left === right ? -1 : left > right ? 0 : 1
  frames.push({ phase: 'done', index: peak, peak, left, right, activeLine: 10,
    message: `${left} ${left === right ? '=' : left > right ? '>' : '<'} ${right}: return ${result} (${result < 0 ? 'equal sums' : result === 0 ? 'ascending wins' : 'descending wins'}).` })
  return { input: [...nums], peak, left, right, result, frames }
}

export const code = `def compareSums(nums):
    peak = 0
    while peak + 1 < len(nums) and nums[peak] < nums[peak + 1]:
        peak += 1
    ascending = descending = 0
    for i in range(peak + 1):
        ascending += nums[i]
    for i in range(peak, len(nums)):
        descending += nums[i]
    return -1 if ascending == descending else (0 if ascending > descending else 1)`
  .split('\n').map((text, index) => ({ line: index + 1, text }))
