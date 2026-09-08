export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || !nums.length || nums.length > 100000 || nums.some(n => !Number.isInteger(n) || n < 1 || n > 1000000000)) throw new Error('Enter a JSON array of 1–100,000 integers, each between 1 and 1,000,000,000.')
  return nums
}
export function buildTrace(nums) {
  const offsets = new Array(nums.length).fill(0)
  const frames = [{ phase: 'start', index: 0, total: 0, drop: 0, activeLine: 2, message: 'Each adjacent drop needs a paid increase that starts at its right endpoint.' }]
  let total = 0
  for (let i = 1; i < nums.length; i++) {
    const drop = Math.max(0, nums[i - 1] - nums[i])
    frames.push({ phase: 'compare', index: i, total, drop, activeLine: 4, message: `Compare original values ${nums[i - 1]} and ${nums[i]}: drop = ${drop}.` })
    total += drop
    offsets[i] = total
    frames.push({ phase: 'apply', index: i, total, drop, activeLine: 5,
      message: drop ? `Add ${drop} to the entire suffix [${i}..${nums.length - 1}]. Total cost: ${total}.` : 'This boundary is already non-decreasing; no cost is added.' })
  }
  frames.push({ phase: 'done', index: nums.length - 1, total, drop: 0, activeLine: 6, message: `Minimum total increment cost: ${total}. The constructed array is non-decreasing.` })
  return { input: [...nums], offsets, result: total, frames }
}
export function valueAtStep(run, step, index) {
  const processed = step.phase === 'compare' ? step.index - 1 : step.index
  return run.input[index] + run.offsets[Math.min(index, processed)]
}
export const code = `def minOperations(nums):
    cost = 0
    for i in range(1, len(nums)):
        drop = max(0, nums[i - 1] - nums[i])
        cost += drop
    return cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
