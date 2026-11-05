const JS = [
  'function countCompleteSubarrays(nums) {',
  '  const target = new Set(nums).size',
  '  const counts = new Map()',
  '  let right = 0',
  '  let total = 0',
  '  for (let left = 0; left < nums.length; left++) {',
  '    while (counts.size < target && right < nums.length) {',
  '      counts.set(nums[right], (counts.get(nums[right]) ?? 0) + 1)',
  '      right++',
  '    }',
  '    if (counts.size === target) total += nums.length - right + 1',
  '    counts.set(nums[left], counts.get(nums[left]) - 1)',
  '    if (counts.get(nums[left]) === 0) counts.delete(nums[left])',
  '  }',
  '  return total',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `def count_complete_subarrays(nums):
    target = len(set(nums))
    counts = {}
    right = 0
    total = 0
    for left in range(len(nums)):
        while len(counts) < target and right < len(nums):
            counts[nums[right]] = counts.get(nums[right], 0) + 1
            right += 1
        if len(counts) == target:
            total += len(nums) - right + 1
        counts[nums[left]] -= 1
        if counts[nums[left]] == 0:
            del counts[nums[left]]
    return total`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Each value in nums is an integer from 1 to 6.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const target = new Set(nums).size
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('const target'), pythonLine: P('target = len'), target, left: 0, right: 0, distinct: 0, total: 0, message: `A complete subarray has ${target} distinct values, the same as the whole array.` }]
  let right = 0, total = 0
  const distinct = () => counts.size
  for (let left = 0; left < n; left++) {
    while (distinct() < target && right < n) {
      const v = nums[right]
      counts.set(v, (counts.get(v) ?? 0) + 1)
      right++
      frames.push({ phase: 'extend', activeLine: L('counts.set(nums[right]'), pythonLine: P('counts[nums[right]]'), target, left, right, distinct: distinct(), total, message: `Move r to add ${v}. The window ${left} to ${right - 1} has ${distinct()} distinct values.` })
    }
    if (distinct() === target) {
      total += n - right + 1
      frames.push({ phase: 'count', activeLine: L('total += nums.length'), pythonLine: P('total += len'), target, left, right, distinct: distinct(), total, message: `Ends ${right - 1} to ${n - 1} all complete the subarray starting at l = ${left}. Total ${total}.` })
    }
    const v = nums[left]
    counts.set(v, counts.get(v) - 1)
    if (counts.get(v) === 0) counts.delete(v)
    frames.push({ phase: 'shrink', activeLine: L('counts.set(nums[left]'), pythonLine: P('counts[nums[left]] -= 1'), target, left: left + 1, right, distinct: distinct(), total, message: `Move l past ${v}, so the next start is ${left + 1}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), target, left: n, right, distinct: 0, total, message: `There are ${total} complete subarrays.` })
  return { input: { nums }, result: total, frames }
}
