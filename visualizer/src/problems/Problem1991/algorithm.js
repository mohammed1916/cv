export const phases = [
  { id: 'start', label: 'Total sum', description: 'Find the total once, so the right-side sum is total minus the left sum minus the current value.' },
  { id: 'check', label: 'Compare sides', description: 'At each index compare the left sum with the right sum; the first equal pair wins.' },
  { id: 'advance', label: 'Move right', description: 'Add the current value to the left sum and try the next index.' },
  { id: 'done', label: 'Result', description: 'Return the leftmost index with equal sides, or -1.' },
]

export const code = `function findMiddleIndex(nums) {
  const total = nums.reduce((sum, value) => sum + value, 0)
  let left = 0
  for (let i = 0; i < nums.length; i++) {
    const right = total - left - nums[i]
    if (left === right) return i
    left += nums[i]
  }
  return -1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def find_middle_index(nums):
    total = sum(nums)
    left = 0
    for i in range(len(nums)):
        right = total - left - nums[i]
        if left == right:
            return i
        left += nums[i]
    return -1
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [2,3,-1,8,4].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 100) throw new Error('nums must have 1 to 100 values.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value must be a whole number between -1000 and 1000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const total = nums.reduce((sum, value) => sum + value, 0)
  let left = 0
  let answer = -1
  const add = (phase, c, p, message, index, right) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, total, index, left, right, answer },
  })
  add('start', 'const total', 'total = sum', `Total is ${total}.`, -1, null)
  for (let i = 0; i < nums.length; i++) {
    const right = total - left - nums[i]
    if (left === right) {
      answer = i
      add('check', 'if (left === right)', 'if left == right', `Index ${i}: left ${left} equals right ${right}. This is the leftmost middle index.`, i, right)
      break
    }
    add('check', 'if (left === right)', 'if left == right', `Index ${i}: left ${left} and right ${right} differ.`, i, right)
    left += nums[i]
    add('advance', 'left += nums', 'left += nums', `Move past index ${i}; the left sum is now ${left}.`, i, right)
  }
  add('done', 'return -1', 'return -1', answer === -1 ? 'No index balances the two sides.' : `Leftmost middle index is ${answer}.`, answer, null)
  return { input: nums, result: answer, frames }
}
