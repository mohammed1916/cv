export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use a JSON object with a "nums" array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 entries for this visualization.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each value must be an integer from 1 to 100000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const first = nums[0]
  const last = nums[n - 1]
  const frames = []
  frames.push({ phase: 'start', activeLine: L('set first to'), index: 0, first, last, result: null, message: `The first element is ${first}. Each player keeps deleting, so the endpoints are the only candidates.` })
  frames.push({ phase: 'ends', activeLine: L('set last to'), index: n - 1, first, last, result: null, message: `The last element is ${last}.` })
  if (n === 1) {
    frames.push({ phase: 'done', activeLine: L('return that element'), index: 0, first, last, result: first, message: `Only ${first} remains.` })
    return { input: { nums }, result: first, frames }
  }
  const result = Math.max(first, last)
  frames.push({ phase: 'done', activeLine: L('return the larger'), index: first >= last ? 0 : n - 1, first, last, result, message: `Alice can keep the larger end, ${result}. Bob cannot remove it.` })
  return { input: { nums }, result, frames }
}

export const code = `final element after subarray deletions (nums):
  set first to the first element of nums
  set last to the last element of nums
  if nums has one element then
    return that element
  Alice can delete everything except the two ends in one move
  Bob can always delete any middle element left in the array
  so neither middle value can decide the final element
  return the larger of first and last`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def final_element(nums):
    if len(nums) == 1:
        return nums[0]
    first = nums[0]
    last = nums[-1]
    return max(first, last)
`
