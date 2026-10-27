export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 10)) throw new Error('Each value in nums is an integer from 1 to 10.')
  if (!Number.isInteger(input.threshold) || input.threshold < 1 || input.threshold > 10) throw new Error('threshold is an integer from 1 to 10.')
  return { nums, threshold: input.threshold }
}

export function buildTrace({ nums, threshold }) {
  const n = nums.length
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), start: -1, end: -1, best, message: `Find the longest run that starts even, alternates parity, and keeps every value at most ${threshold}.` }]
  for (let i = 0; i < n; i++) {
    if (nums[i] % 2 !== 0 || nums[i] > threshold) {
      frames.push({ phase: 'skip', activeLine: L('skip to the next start'), start: i, end: i - 1, best, message: `${nums[i]} cannot start a run.` })
      continue
    }
    let length = 1
    let j = i + 1
    frames.push({ phase: 'begin', activeLine: L('set length to one'), start: i, end: i, best, message: `${nums[i]} is even and fits, so a run starts at ${i}.` })
    while (j < n && nums[j] <= threshold && nums[j] % 2 !== nums[j - 1] % 2) {
      length++
      j++
      frames.push({ phase: 'extend', activeLine: L('extend the run'), start: i, end: j - 1, best, message: `Add ${nums[j - 1]}. The run from ${i} now has length ${length}.` })
    }
    best = Math.max(best, length)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), start: i, end: j - 1, best, message: `Best length is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), start: -1, end: -1, best, message: `The longest even odd subarray has length ${best}.` })
  return { input: { nums, threshold }, result: best, frames }
}

export const code = `longest even odd subarray with threshold (nums, threshold)
  set best to zero
  for each start index i
    if nums at i is odd or above threshold then skip to the next start
    set length to one and end to i
    while the next value fits the even odd pattern and threshold
      extend the run by one value
    set best to the larger of best and length
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_even_odd(nums, threshold):
    best = 0
    for i in range(len(nums)):
        if nums[i] % 2 != 0 or nums[i] > threshold:
            continue
        length = 1
        j = i + 1
        while j < len(nums) and nums[j] <= threshold and nums[j] % 2 != nums[j - 1] % 2:
            length += 1
            j += 1
        best = max(best, length)
    return best
`
