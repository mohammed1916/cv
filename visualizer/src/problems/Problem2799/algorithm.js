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
  const frames = [{ phase: 'start', activeLine: L('set target to'), target, left: 0, right: 0, distinct: 0, total: 0, message: `A complete subarray has ${target} distinct values, the same as the whole array.` }]
  let right = 0, total = 0
  const distinct = () => counts.size
  for (let left = 0; left < n; left++) {
    while (distinct() < target && right < n) {
      const v = nums[right]
      counts.set(v, (counts.get(v) ?? 0) + 1)
      right++
      frames.push({ phase: 'extend', activeLine: L('add the value at right'), target, left, right, distinct: distinct(), total, message: `Add ${v}. The window ${left} to ${right - 1} has ${distinct()} distinct values.` })
    }
    if (distinct() === target) {
      total += n - right + 1
      frames.push({ phase: 'count', activeLine: L('add nums length minus right'), target, left, right, distinct: distinct(), total, message: `Ends ${right - 1} to ${n - 1} all complete the subarray starting at ${left}. Total ${total}.` })
    }
    const v = nums[left]
    counts.set(v, counts.get(v) - 1)
    if (counts.get(v) === 0) counts.delete(v)
    frames.push({ phase: 'shrink', activeLine: L('remove the value at left'), target, left: left + 1, right, distinct: distinct(), total, message: `Remove ${v} from the left, so the next start is ${left + 1}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), target, left: n, right, distinct: 0, total, message: `There are ${total} complete subarrays.` })
  return { input: { nums }, result: total, frames }
}

export const code = `count complete subarrays (nums)
  set target to the number of distinct values in nums
  set counts to an empty map, right to zero and total to zero
  for each left index
    while the window is short of target and right is inside nums
      add the value at right and move right one step
    if the window has target distinct values then add nums length minus right plus one to total
    remove the value at left from the window
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_complete_subarrays(nums):
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
    return total
`
