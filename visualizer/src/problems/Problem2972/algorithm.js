export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  const { nums } = obj
  if (nums.length < 1 || nums.length > 20) throw new Error('nums needs 1 to 20 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Values are integers from 1 to 10 in this visualization.')
  return { nums }
}

export function buildTrace(input) {
  const nums = input.nums
  const n = nums.length
  let p = 0
  while (p + 1 < n && nums[p + 1] > nums[p]) p++
  const frames = [{ phase: 'prefix', activeLine: L('set p to the end'), i: p, j: -1, message: `The prefix up to index ${p} is strictly increasing.` }]
  if (p === n - 1) {
    const result = n * (n + 1) / 2
    frames.push({ phase: 'done', activeLine: L('return total'), i: p, j: -1, message: `The whole array is increasing, so all ${result} subarrays can be removed.` })
    return { input, result, frames }
  }
  let s = n - 1
  while (s - 1 >= 0 && nums[s - 1] < nums[s]) s--
  frames.push({ phase: 'suffix', activeLine: L('find the start of the increasing suffix'), i: p, j: s, message: `The suffix from index ${s} is strictly increasing.` })
  let total = 0
  let j = 0
  for (let i = -1; i <= p; i++) {
    const lo = Math.max(i + 2, s, 1)
    j = Math.max(j, lo)
    while (j < n && i >= 0 && nums[j] <= nums[i]) j++
    total += n - j + 1
    frames.push({ phase: 'pair', activeLine: L('add the number of valid right starts'), i, j, message: `Keep the prefix ending at ${i}: ${n - j + 1} subarrays can be removed. Total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), i: p, j: n, message: `Total of ${total} incremovable subarrays.` })
  return { input, result: total, frames }
}

export const code = `count incremovable subarrays
  set p to the end of the longest strictly increasing prefix
  if p is the last index then count every subarray and stop
  find the start of the increasing suffix as s
  set total to 0 and j to 0
  for each kept prefix end i from minus one to p do
    set lo to the largest of i plus 2, s and 1
    move j right to lo or further while nums[j] is at most nums[i]
    add the number of valid right starts, n minus j plus 1, to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def incremovable_subarrays(nums):
    n = len(nums)
    p = 0
    while p + 1 < n and nums[p + 1] > nums[p]:
        p += 1
    if p == n - 1:
        return n * (n + 1) // 2
    s = n - 1
    while s - 1 >= 0 and nums[s - 1] < nums[s]:
        s -= 1
    total = 0
    j = 0
    for i in range(-1, p + 1):
        lo = max(i + 2, s, 1)
        j = max(j, lo)
        while j < n and i >= 0 and nums[j] <= nums[i]:
            j += 1
        total += n - j + 1
    return total
`
