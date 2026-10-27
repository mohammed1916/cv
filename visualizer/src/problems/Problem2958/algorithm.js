export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object with an integer array nums and an integer k, for example {"nums":[1,2,3,1,2,3,1,2],"k":2}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Each value in nums must be an integer from 1 to 20.')
  if (data.k < 1 || data.k > 30) throw new Error('k must be an integer from 1 to 30.')
  return { nums: [...data.nums], k: data.k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const counts = new Map()
  let left = 0
  let best = 0
  const tally = () => Object.fromEntries([...counts].sort((a, b) => a[0] - b[0]))
  frames.push({ phase: 'start', activeLine: L('set counts to an empty tally'), left, right: -1, counts: {}, best, message: `Start with an empty tally. A value may appear at most ${k} times in the window.` })
  for (let right = 0; right < nums.length; right++) {
    counts.set(nums[right], (counts.get(nums[right]) || 0) + 1)
    frames.push({ phase: 'extend', activeLine: L('add one to the tally'), left, right, counts: tally(), best, message: `Add ${nums[right]} at index ${right}. It now appears ${counts.get(nums[right])} time${counts.get(nums[right]) === 1 ? '' : 's'}.` })
    while (counts.get(nums[right]) > k) {
      counts.set(nums[left], counts.get(nums[left]) - 1)
      left++
      frames.push({ phase: 'shrink', activeLine: L('remove one from the tally'), left, right, counts: tally(), best, message: `${nums[right]} is over the limit. Drop the left value and move the left edge to ${left}.` })
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), left, right, counts: tally(), best, message: `Window ${left} to ${right} is valid with length ${right - left + 1}. Best is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: -1, counts: tally(), best, message: `Longest valid subarray: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `length of longest subarray with at most k frequency (nums, k)
  set counts to an empty tally, left to 0, and best to 0
  for each index right in nums
    add one to the tally for nums at right
    while the tally for nums at right is more than k
      remove one from the tally for nums at left
      move left one step right
    set best to the larger of best and right minus left plus one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def longest_subarray(nums, k):
    counts = {}
    left = 0
    best = 0
    for right, value in enumerate(nums):
        counts[value] = counts.get(value, 0) + 1
        while counts[value] > k:
            counts[nums[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`
