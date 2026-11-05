// The input box takes an object with nums, as the sequence-family visualizer does.
export function parseInput(text) {
  const nums = JSON.parse(text)?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000)) throw new Error('Enter a JSON array of 1–10,000 integers with |v| ≤ 1,000.')
  return nums
}

const JS_LINES = [
  'function pivotIndex(nums) {',
  '  const total = nums.reduce((sum, v) => sum + v, 0) // sum of every value',
  '  let leftSum = 0 // sum strictly to the left of i',
  '  for (let i = 0; i < nums.length; i++) {',
  '    const rightSum = total - leftSum - nums[i] // sum strictly to the right of i',
  '    if (leftSum === rightSum) return i // the leftmost pivot is the first match',
  '    leftSum += nums[i] // move i one step right',
  '  }',
  '  return -1 // no index balances the two sides',
  '}',
]
const PY_LINES = [
  'def pivot_index(nums):',
  '    total = sum(nums)',
  '    left_sum = 0',
  '    for i, value in enumerate(nums):',
  '        right_sum = total - left_sum - value',
  '        if left_sum == right_sum:',
  '            return i',
  '        left_sum += value',
  '    return -1',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// The total is computed once. Walking i left to right, the right sum is total - left - nums[i].
export function buildTrace(nums) {
  const total = nums.reduce((sum, v) => sum + v, 0)
  let leftSum = 0
  const frames = [{ phase: 'start', index: -1, leftSum, rightSum: null, total, activeLine: L('const total'), pythonLine: P('total = sum'), message: `Total of all values is ${total}. Start with nothing on the left.` }]
  for (let i = 0; i < nums.length; i++) {
    const rightSum = total - leftSum - nums[i]
    const hit = leftSum === rightSum
    frames.push({ phase: hit ? 'found' : 'check', index: i, leftSum, rightSum, total, activeLine: L('const rightSum'), pythonLine: P('right_sum ='),
      message: hit ? `At index ${i}: left ${leftSum} equals right ${rightSum}. This is the leftmost pivot.` : `At index ${i}: left ${leftSum}, right ${rightSum}. Not equal; move on.` })
    if (hit) return { input: nums, result: i, frames: [...frames, { phase: 'done', index: i, leftSum, rightSum, total, result: i, activeLine: L('return i'), pythonLine: P('return i'), message: `Pivot index ${i}.` }] }
    leftSum += nums[i]
    frames.push({ phase: 'advance', index: i, leftSum, rightSum, total, activeLine: L('leftSum += nums[i]'), pythonLine: P('left_sum += value'), message: `Include nums[${i}] = ${nums[i]} on the left; left is now ${leftSum}.` })
  }
  frames.push({ phase: 'done', index: nums.length - 1, leftSum, rightSum: null, total, result: -1, activeLine: L('return -1'), pythonLine: P('return -1'), message: 'No index balances the two sides. The answer is -1.' })
  return { input: nums, result: -1, frames }
}
