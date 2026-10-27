export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Number.isInteger(data.k)) throw new Error('Use an object with a 0/1 array nums and an integer k, for example {"nums":[1,1,0,0,1],"k":1}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values.')
  if (data.nums.some(v => v !== 0 && v !== 1)) throw new Error('nums may contain only 0 and 1.')
  if (data.k < 0 || data.k > 30) throw new Error('k must be an integer from 0 to 30.')
  return { nums: [...data.nums], k: data.k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let left = 0
  let zeros = 0
  let best = 0
  frames.push({ phase: 'start', activeLine: L('set left to 0'), left, right: -1, zeros, best, message: `Start an empty window. It may hold at most ${k} zeros.` })
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++
    frames.push({ phase: 'extend', activeLine: L('add one to zeros'), left, right, zeros, best, message: `Extend the window to index ${right}. It holds ${zeros} zero${zeros === 1 ? '' : 's'}.` })
    while (zeros > k) {
      if (nums[left] === 0) zeros--
      left++
      frames.push({ phase: 'shrink', activeLine: L('move left one step right'), left, right, zeros, best, message: `Too many zeros. Move the left edge to ${left}.` })
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'record', activeLine: L('set best to the larger'), left, right, zeros, best, message: `The window ${left} to ${right} is valid with length ${right - left + 1}. Best is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), left, right: -1, zeros, best, message: `Longest window with at most ${k} zeros: ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `max consecutive ones III (nums, k)
  set left to 0, zeros to 0, and best to 0
  for each index right in nums
    if nums at right is 0 then add one to zeros
    while zeros is more than k
      if nums at left is 0 then subtract one from zeros
      move left one step right
    set best to the larger of best and right minus left plus one
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def max_consecutive_ones(nums, k):
    left = 0
    zeros = 0
    best = 0
    for right in range(len(nums)):
        if nums[right] == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`
