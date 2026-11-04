export const phases = [
  { id: 'start', label: 'Start', description: 'Sort the values so the smallest and largest of any group sit at the two ends.' },
  { id: 'shrink', label: 'Too large', description: 'The smallest and largest remaining values already exceed the target, so the largest value cannot be a maximum. Drop it.' },
  { id: 'count', label: 'Count subsequences', description: 'The smallest value is the minimum. Every subset of the values between it and the largest allowed value can join it.' },
  { id: 'done', label: 'Complete', description: 'Report the total modulo 1,000,000,007.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"nums": [3, 5, 6], "target": 9}.')
  const { nums, target } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('nums is a list of 1 to 12 integers from 1 to 100.')
  if (!Number.isInteger(target) || target < 1 || target > 200) throw new Error('target is an integer from 1 to 200.')
  return { nums, target }
}

const MOD = 1000000007

export function buildTrace({ nums, target }) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const power = [1]
  for (let i = 1; i < n; i++) power.push((power[i - 1] * 2) % MOD)
  let left = 0, right = n - 1, total = 0
  const snap = (add, sum) => ({ sorted, left, right, sum, add, total })
  const frames = [{
    phase: 'start', activeLine: L('nums.sort((a, b) => a - b)'), pythonLine: P('nums.sort()'), snapshot: snap(null, null),
    message: `Sorted values: ${sorted.join(', ')}. Target ${target}. Pointers start at the two ends.`,
  }]
  while (left <= right) {
    const sum = sorted[left] + sorted[right]
    if (sum > target) {
      frames.push({
        phase: 'shrink', activeLine: L('right -= 1'), pythonLine: P('right -= 1'), snapshot: snap(null, sum),
        message: `${sorted[left]} + ${sorted[right]} = ${sum} is above ${target}. Even the smallest value with the largest one is too much, so ${sorted[right]} is not a maximum. Move the right pointer left.`,
      })
      right -= 1
    } else {
      const add = power[right - left]
      total = (total + add) % MOD
      frames.push({
        phase: 'count', activeLine: L('total = (total + power'), pythonLine: P('total = (total + power'), snapshot: snap(add, sum),
        message: `${sorted[left]} + ${sorted[right]} = ${sum} fits. Fix ${sorted[left]} as the minimum and ${sorted[right]} as the maximum: the ${right - left - 1 < 0 ? 0 : right - left - 1} values between them can be in or out, which adds 2^${right - left} = ${add}. Total ${total}.`,
      })
      left += 1
    }
  }
  frames.push({
    phase: 'done', activeLine: L('return total'), pythonLine: P('return total'), snapshot: snap(null, null),
    message: `Every nonempty subsequence with minimum + maximum at most ${target} is counted: ${total} in total, modulo 1,000,000,007.`,
  })
  return { input: { nums, target }, result: total, frames }
}

export const code = [
  "function countSubsequences(nums, target) {",
  "  nums.sort((a, b) => a - b)",
  "  const power = [1]; for (let i = 1; i < nums.length; i++) power.push((power[i - 1] * 2) % MOD)",
  "  let left = 0, right = nums.length - 1, total = 0",
  "  while (left <= right) {",
  "    if (nums[left] + nums[right] > target) {",
  "      right -= 1 } else {",
  "      total = (total + power[right - left]) % MOD",
  "      left += 1 }",
  "  }",
  "  return total }",
].map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_subseq(nums, target):
    MOD = 10**9 + 7
    nums.sort()
    n = len(nums)
    power = [1] * n
    for i in range(1, n):
        power[i] = power[i - 1] * 2 % MOD
    left, right, total = 0, n - 1, 0
    while left <= right:
        if nums[left] + nums[right] > target:
            right -= 1
        else:
            total = (total + power[right - left]) % MOD
            left += 1
    return total
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
