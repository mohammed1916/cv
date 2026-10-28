export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 40) throw new Error('Use {"nums": [...], "k": n} with 1 to 40 numbers.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 60)) throw new Error('Each number is an integer from 1 to 60.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 60) throw new Error('k is an integer from 1 to 60.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const frames = [{ phase: 'start', activeLine: L('sort a copy'), index: mid, cost: 0, message: `Sorted. The median sits at position ${mid}, which holds ${sorted[mid]}. The target is ${k}.` }]
  let cost = 0
  if (sorted[mid] === k) {
    frames.push({ phase: 'match', activeLine: L('already k'), index: mid, cost, message: `The median is already ${k}, so no changes are needed.` })
  } else if (sorted[mid] < k) {
    for (let i = mid; i < sorted.length; i++) {
      cost += Math.max(0, k - sorted[i])
      frames.push({ phase: 'raise', activeLine: L('raise each'), index: i, cost, message: `Raise ${sorted[i]} to ${k} if it is below k. Cost so far: ${cost}.` })
    }
  } else {
    for (let i = 0; i <= mid; i++) {
      cost += Math.max(0, sorted[i] - k)
      frames.push({ phase: 'lower', activeLine: L('lower each'), index: i, cost, message: `Lower ${sorted[i]} to ${k} if it is above k. Cost so far: ${cost}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return cost'), index: -1, cost, message: `Minimum operations: ${cost}.` })
  return { input, sorted, mid, result: cost, frames }
}

export const code = `minimum operations to make the median equal k
  sort a copy of nums
  set mid to the length divided by two, rounded down
  set cost to 0
  if the value at mid is already k then return 0
  if the value at mid is below k then
    for each position from mid to the end, raise each number to k if it is below k
    and add each gap to cost
  otherwise
    for each position from the start to mid, lower each number to k if it is above k
    and add each gap to cost
  return cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_to_median(nums, k):
    arr = sorted(nums)
    mid = len(arr) // 2
    total = 0
    if arr[mid] == k:
        return 0
    if arr[mid] < k:
        for i in range(mid, len(arr)):
            total += max(0, k - arr[i])
    else:
        for i in range(0, mid + 1):
            total += max(0, arr[i] - k)
    return total
`
