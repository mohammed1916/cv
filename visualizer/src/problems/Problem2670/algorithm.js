export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use an array of 1 to 20 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value is an integer from 1 to 50.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = [{ phase: 'start', activeLine: L('set suffixCount to'), active: -1, roles: {}, state: {}, message: 'First count distinct values in each suffix, from the right.' }]
  const suffixCount = Array(n + 1).fill(0)
  const seenRight = new Set()
  for (let i = n - 1; i >= 0; i--) {
    seenRight.add(nums[i])
    suffixCount[i] = seenRight.size
    frames.push({ phase: 'suffix', activeLine: L('set suffixCount[i]'), active: i, roles: { [i]: 'suffix' }, state: { suffixDistinct: suffixCount[i] }, message: `Suffix from ${i} has ${suffixCount[i]} distinct values.` })
  }
  const seen = new Set()
  const diff = []
  for (let i = 0; i < n; i++) {
    seen.add(nums[i])
    diff.push(seen.size - suffixCount[i + 1])
    frames.push({ phase: 'prefix', activeLine: L('set diff[i]'), active: i, roles: { [i]: 'prefix' }, state: { prefixDistinct: seen.size, suffixDistinct: suffixCount[i + 1], difference: diff[i] }, message: `Prefix up to ${i} has ${seen.size} distinct values; the suffix after it has ${suffixCount[i + 1]}. Difference ${diff[i]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return diff'), active: -1, roles: {}, state: { diff: diff.join(', ') }, message: `Return [${diff.join(', ')}].` })
  return { input: nums, result: diff, items: nums, frames }
}

export const code = `distinct difference array of nums
  set suffixCount to a list of n plus 1 zeros
  set seen to an empty set
  for i from n minus 1 down to 0
    add nums[i] to seen
    set suffixCount[i] to the size of seen
  set seen to an empty set
  for i from 0 to n minus 1
    add nums[i] to seen
    set diff[i] to the size of seen minus suffixCount[i + 1]
  return diff`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def distinct_difference_array(nums):
    n = len(nums)
    suffix_count = [0] * (n + 1)
    seen = set()
    for i in range(n - 1, -1, -1):
        seen.add(nums[i])
        suffix_count[i] = len(seen)
    seen = set()
    diff = []
    for i in range(n):
        seen.add(nums[i])
        diff.append(len(seen) - suffix_count[i + 1])
    return diff
`
