export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums needs 1 to 20 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Values are integers from 1 to 100.')
  return { nums }
}

export function buildTrace(input) {
  const sorted = [...input.nums].sort((a, b) => a - b)
  const n = sorted.length
  const half = Math.floor(n / 2)
  const frames = [{ phase: 'sort', activeLine: L('sort nums'), i: -1, j: -1, sorted, count: 0, message: `Sorted values: ${sorted.join(', ')}. The smallest half can be doubled.` }]
  let count = 0
  for (let j = half; j < n; j++) {
    if (count < half && 2 * sorted[count] <= sorted[j]) {
      count++
      frames.push({ phase: 'pair', activeLine: L('increase count'), i: count - 1, j, sorted, count, message: `Mark ${sorted[count - 1]} and ${sorted[j]}, since 2 times ${sorted[count - 1]} is at most ${sorted[j]}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('for each j'), i: count, j, sorted, count, message: `${sorted[j]} is too small to take the next small value ${count < half ? sorted[count] : '(none left)'}; move on.` })
    }
  }
  const result = 2 * count
  frames.push({ phase: 'done', activeLine: L('return 2 times count'), i: count, j: n, sorted, count, message: `${count} pairs were found, so ${result} indices are marked.` })
  return { input, result, frames }
}

export const code = `maximum number of marked indices
  sort nums
  set half to the length of nums divided by 2, rounded down
  set count to 0
  for each j from half to the last index do
    if count is less than half and 2 times nums[count] is at most nums[j] then
      increase count by one
  return 2 times count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_marked_indices(nums):
    values = sorted(nums)
    half = len(values) // 2
    count = 0
    for j in range(half, len(values)):
        if count < half and 2 * values[count] <= values[j]:
            count += 1
    return 2 * count
`
