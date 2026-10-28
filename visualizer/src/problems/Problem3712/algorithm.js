export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums) || !Number.isInteger(obj.k)) throw new Error('Use an object with a nums array and an integer k.')
  if (obj.nums.length < 1 || obj.nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('Values are integers from 1 to 100.')
  if (obj.k < 1 || obj.k > 100) throw new Error('k is an integer from 1 to 100.')
  return { nums: obj.nums, k: obj.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const counts = new Map()
  const frames = [{ phase: 'start', activeLine: L('set counts to empty'), index: -1, value: null, count: 0, total: 0, message: `Count how often each value appears. We keep values whose count is a multiple of ${k}.` }]
  for (let i = 0; i < nums.length; i++) {
    counts.set(nums[i], (counts.get(nums[i]) || 0) + 1)
    frames.push({ phase: 'count', activeLine: L('add 1 to counts'), index: i, value: nums[i], count: counts.get(nums[i]), total: 0, message: `Count ${nums[i]} as ${counts.get(nums[i])}.` })
  }
  let total = 0
  for (const [value, c] of counts) {
    if (c % k === 0) {
      total += value * c
      frames.push({ phase: 'add', activeLine: L('add value times c'), index: -1, value, count: c, total, message: `${value} appears ${c} times, a multiple of ${k}. Add ${value * c}.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if c modulo k'), index: -1, value, count: c, total, message: `${value} appears ${c} times, which is not a multiple of ${k}. Skip it.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, value: null, count: 0, total, message: `Sum: ${total}.` })
  return { input, result: total, frames }
}

export const code = `sum of elements whose frequency is divisible by k:
  set counts to empty
  for each value in nums:
    add 1 to counts for that value
  set total to 0
  for each value v with count c in counts:
    if c modulo k equals 0 then
      add value times c to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_frequency_divisible(nums, k):
    counts = {}
    for x in nums:
        counts[x] = counts.get(x, 0) + 1
    total = 0
    for value, c in counts.items():
        if c % k == 0:
            total += value * c
    return total
`
