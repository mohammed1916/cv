export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.target)) throw new Error('Use an object with an integer array nums and an integer target.')
  if (input.nums.length < 1 || input.nums.length > 30) throw new Error('nums must have 1 to 30 entries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Each entry of nums is an integer from 1 to 100.')
  if (input.target < 1 || input.target > 5000) throw new Error('target must be an integer from 1 to 5000.')
  return { nums: input.nums, target: input.target }
}

export function buildTrace({ nums, target }) {
  const n = nums.length
  const total = nums.reduce((a, b) => a + b, 0)
  const full = Math.floor(target / total)
  const rem = target % total
  const frames = []
  frames.push({ phase: 'total', activeLine: L('set total to the sum'), left: 0, right: -1, window: 0, best: null, full, rem, message: `One copy sums to ${total}. Target ${target} is ${full} whole copies plus ${rem}.` })
  if (rem === 0) {
    const result = full * n
    frames.push({ phase: 'done', activeLine: L('return full times'), left: 0, right: -1, window: 0, best: null, full, rem, result, message: `The target is a whole number of copies, so the answer is ${result}.` })
    return { input: { nums, target }, result, frames }
  }
  const doubled = [...nums, ...nums]
  let left = 0
  let window = 0
  let best = null
  for (let right = 0; right < doubled.length; right++) {
    window += doubled[right]
    frames.push({ phase: 'extend', activeLine: L('add the value at right'), left, right, window, best, full, rem, message: `Add ${doubled[right]} at position ${right}; the window sums to ${window}.` })
    while (window > rem) {
      window -= doubled[left]
      left++
      frames.push({ phase: 'shrink', activeLine: L('while window is greater'), left, right, window, best, full, rem, message: `The window is above ${rem}, so the start moves to ${left}.` })
    }
    if (window === rem && (best === null || right - left + 1 < best)) {
      best = right - left + 1
      frames.push({ phase: 'record', activeLine: L('the length is smaller'), left, right, window, best, full, rem, message: `The window sums to ${rem} with length ${best}.` })
    }
  }
  const result = best === null ? -1 : best + full * n
  frames.push({ phase: 'done', activeLine: L('return -1'), left, right: doubled.length - 1, window, best, full, rem, result, message: result === -1 ? 'No window sums to the leftover, so the answer is -1.' : `Shortest window ${best} plus ${full} whole copies of length ${n}: ${result}.` })
  return { input: { nums, target }, result, frames }
}

export const code = `minimum size subarray in the infinite array (nums, target):
  set total to the sum of nums
  set full to target divided by total, rounded down
  set rem to target modulo total
  if rem is 0 then return full times the length of nums
  set doubled to two copies of nums
  set left to 0, window to 0 and best to nothing
  for each position right in doubled
    add the value at right to window
    while window is greater than rem
      subtract the value at left from window and move left forward
    if window equals rem and (best is nothing or the length is smaller) then set best to the length
  if best is nothing then return -1
  return best plus full times the length of nums`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_size_subarray(nums, target):
    n = len(nums)
    total = sum(nums)
    full, rem = divmod(target, total)
    if rem == 0:
        return full * n
    doubled = nums + nums
    best = None
    left = 0
    window = 0
    for right, value in enumerate(doubled):
        window += value
        while window > rem:
            window -= doubled[left]
            left += 1
        if window == rem and (best is None or right - left + 1 < best):
            best = right - left + 1
    if best is None:
        return -1
    return best + full * n
`
