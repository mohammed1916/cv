export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 100000)) throw new Error('Enter a JSON array of 1–10,000 integers with |v| ≤ 100,000.')
  return nums
}

// Find the first descent. Lowering the left value works if the value before it is not larger than the right
// value; otherwise the right value must be raised. A second descent means the answer is false.
export function buildTrace(nums) {
  const a = [...nums]
  let changes = 0
  const frames = [{ phase: 'start', index: -1, changes, values: [...a], activeLine: 2, message: 'Scan for descents; at most one is allowed.' }]
  for (let i = 1; i < a.length; i++) {
    if (a[i - 1] <= a[i]) continue
    changes++
    if (changes > 1) {
      frames.push({ phase: 'reject', index: i, changes, values: [...a], activeLine: 6, message: `Second descent at ${i - 1}, ${i}: one change cannot fix both.` })
      break
    }
    if (i < 2 || a[i - 2] <= a[i]) { a[i - 1] = a[i]; frames.push({ phase: 'lower', index: i - 1, changes, values: [...a], activeLine: 8, message: `Lower a[${i - 1}] to ${a[i]}.` }) }
    else { a[i] = a[i - 1]; frames.push({ phase: 'raise', index: i, changes, values: [...a], activeLine: 10, message: `Raise a[${i}] to ${a[i - 1]}.` }) }
  }
  const result = changes <= 1
  frames.push({ phase: 'done', index: a.length - 1, changes, values: [...a], result, activeLine: 12, message: result ? 'At most one change makes the array non-decreasing.' : 'More than one change is needed.' })
  return { input: nums, result, frames }
}

export const code = `def checkPossibility(nums):
    changes = 0
    for i in range(1, len(nums)):
        if nums[i - 1] > nums[i]:
            changes += 1
            if changes > 1: return False
            if i < 2 or nums[i - 2] <= nums[i]: nums[i - 1] = nums[i]
            else: nums[i] = nums[i - 1]
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
