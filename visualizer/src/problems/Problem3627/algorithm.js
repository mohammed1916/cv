export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 3 || nums.length > 12 || nums.length % 3 !== 0) throw new Error('Use an array whose length is 3, 6, 9 or 12.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 30)) throw new Error('Each number is an integer from 1 to 30.')
  return nums
}

export function buildTrace(nums) {
  const sorted = [...nums].sort((a, b) => a - b)
  const n = sorted.length
  const groups = n / 3
  const frames = [{ phase: 'start', activeLine: L('sort a copy'), index: -1, chosen: [], total: 0, message: 'Sorted. Each group takes the largest unused value and the value just below it as its top pair.' }]
  let total = 0
  const chosen = []
  for (let g = 0; g < groups; g++) {
    const median = n - 2 - 2 * g
    total += sorted[median]
    chosen.push(median)
    frames.push({ phase: 'group', activeLine: L('add the value just below'), index: median, chosen: [...chosen], total, message: `Group ${g + 1} has top pair ${sorted[median + 1]} and ${sorted[median]}, so its median is ${sorted[median]}. Sum so far: ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, chosen, total, message: `Maximum median sum: ${total}.` })
  return { input: nums, sorted, result: total, frames }
}

export const code = `maximum sum of medians of disjoint triples
  sort a copy of nums from smallest to largest
  set groups to the count divided by three
  set total to 0
  for each group from 0 to groups minus 1
    add the value just below the largest unused top value to total
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_median_sum(nums):
    arr = sorted(nums)
    n = len(arr)
    total = 0
    for g in range(n // 3):
        total += arr[n - 2 - 2 * g]
    return total
`
