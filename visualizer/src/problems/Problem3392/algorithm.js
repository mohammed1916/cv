export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < -100 || v > 100)) throw new Error('Use 3 to 12 integers from -100 to 100.')
  return nums
}

export function buildTrace(nums) {
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set count to zero'), start: -1, ok: false, count: 0, message: 'Slide a window of three across the array.' }]
  for (let i = 0; i + 2 < nums.length; i++) {
    // The condition is first + third = middle / 2, checked as 2 * (first + third) = middle to stay in integers.
    const ok = 2 * (nums[i] + nums[i + 2]) === nums[i + 1]
    if (ok) count++
    frames.push({ phase: 'check', activeLine: L('for each start index'), start: i, ok, count, message: `Window ${nums[i]}, ${nums[i + 1]}, ${nums[i + 2]} ${ok ? 'meets' : 'fails'} the condition.` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), start: -1, ok: false, count, message: `${count} window(s) meet the condition.` })
  return { input: nums, result: count, frames }
}

export const code = `count subarrays of length three with the condition:
  set count to zero
  for each start index i where a window of three fits
    if twice the sum of the first and third equals the middle then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_subarrays(nums):
    count = 0
    for i in range(len(nums) - 2):
        if 2 * (nums[i] + nums[i + 2]) == nums[i + 1]:
            count += 1
    return count
`
