// The input box takes an object with nums, as the sequence-family visualizer does.
export function parseInput(text) {
  const nums = JSON.parse(text)?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('Enter a JSON array of 1–10,000 integers with |v| ≤ 1,000.')
  return nums
}

// Left sum grows as we pass each index; the right sum is total − left − nums[i].
export function buildTrace(nums) {
  const total = nums.reduce((a, b) => a + b, 0)
  let left = 0
  const frames = [{ phase: 'start', index: -1, left, right: total, activeLine: 1, message: `Total ${total}; check each index as a pivot.` }]
  for (let i = 0; i < nums.length; i++) {
    const right = total - left - nums[i]
    if (left === right) {
      frames.push({ phase: 'found', index: i, left, right, activeLine: 4, message: `Index ${i}: left ${left} = right ${right}.` })
      return { input: nums, result: i, frames, done: true }
    }
    frames.push({ phase: 'scan', index: i, left, right, activeLine: 5, message: `Index ${i}: left ${left} ≠ right ${right}.` })
    left += nums[i]
  }
  frames.push({ phase: 'done', index: -1, left, right: 0, result: -1, activeLine: 6, message: 'No pivot index exists.' })
  return { input: nums, result: -1, frames }
}

export const code = `set total to the sum of nums, and left to 0
for each index i from 0 to the last index
  set right to total minus left minus nums[i]
  if left equals right, stop with answer i
  otherwise add nums[i] to left
return the answer, or -1 if no index matched`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The sequence-family visualizer reports its own step numbers (1 setup, 3 inspect, 4 update, 5 return).
// This maps them onto the pseudocode lines above.
export const LINE_MAP = { 1: 1, 3: 3, 4: 5, 5: 6 }

export const python = `def pivot_index(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1`
