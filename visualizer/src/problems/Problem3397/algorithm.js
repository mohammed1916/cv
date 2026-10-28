export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use an object with nums and k.')
  const { nums, k } = value
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums must have 1 to 8 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 30)) throw new Error('nums values are integers from 0 to 30.')
  if (!Number.isInteger(k) || k < 0 || k > 5) throw new Error('k is an integer from 0 to 5.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const order = nums.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value || a.index - b.index)
  const assigned = nums.map(() => null)
  let previous = -Infinity
  let count = 0
  const frames = [{ phase: 'sort', activeLine: L('sort the values'), index: -1, assigned: [...assigned], count, message: `Process the values from smallest to largest. Each may move by at most ${k}.` }]
  for (const { value, index } of order) {
    const candidate = Math.max(value - k, previous + 1)
    if (candidate <= value + k) {
      assigned[index] = candidate
      count++
      previous = candidate
      frames.push({ phase: 'take', activeLine: L('count it and set previous'), index, assigned: [...assigned], count, message: `${value} moves to ${candidate}, a new distinct value. Count ${count}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if such a value exists'), index, assigned: [...assigned], count, message: `${value} cannot reach a value above ${previous} within ${k}. It adds nothing.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return count'), index: -1, assigned: [...assigned], count, message: `Maximum distinct elements: ${count}.` })
  return { input: { nums, k }, result: count, frames }
}

export const code = `maximum number of distinct elements after one change each:
  sort the values in ascending order
  set previous to negative infinity and count to 0
  for each value do
    choose the smallest new value that is above previous and within k of the value
    if such a value exists then
      count it and set previous to it
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_distinct(nums, k):
    previous = float('-inf')
    count = 0
    for value in sorted(nums):
        candidate = max(value - k, previous + 1)
        if candidate <= value + k:
            count += 1
            previous = candidate
    return count
`
