// Max Consecutive Ones II: the longest run of 1s after flipping at most one 0 to 1.
// A sliding window keeps at most one zero, and its length is the best run so far.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || input.nums.length < 1 || input.nums.length > 12) throw new Error('Use an object with nums: an array of 1 to 12 entries.')
  if (input.nums.some(value => value !== 0 && value !== 1)) throw new Error('nums contains only 0 and 1.')
  return { nums: input.nums }
}

export const CODE_LINES = [
  'def find_max_consecutive_ones(nums):',
  '    left = 0',
  '    zeros = 0',
  '    best = 0',
  '    for right, value in enumerate(nums):',
  '        if value == 0:',
  '            zeros += 1',
  '        while zeros > 1:',
  '            if nums[left] == 0:',
  '                zeros -= 1',
  '            left += 1',
  '        best = max(best, right - left + 1)',
  '    return best',
]
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = CODE_LINES.join('\n') + '\n'

export function buildTrace({ nums }) {
  let left = 0
  let zeros = 0
  let best = 0
  const frames = [{ phase: 'start', activeLine: 4, left, right: -1, zeros, best, nums, message: 'Start with an empty window and no zeros.' }]
  nums.forEach((value, right) => {
    frames.push({ phase: 'right', activeLine: 5, left, right, zeros, best, nums, message: `Extend the window to index ${right} (value ${value}).` })
    if (value === 0) {
      zeros++
      frames.push({ phase: 'zero', activeLine: 7, left, right, zeros, best, nums, message: `That value is 0, so the window now holds ${zeros} zeros.` })
    }
    while (zeros > 1) {
      frames.push({ phase: 'shrink', activeLine: 8, left, right, zeros, best, nums, message: `${zeros} zeros is too many, so move the left edge.` })
      if (nums[left] === 0) zeros--
      left++
    }
    best = Math.max(best, right - left + 1)
    frames.push({ phase: 'best', activeLine: 12, left, right, zeros, best, nums, message: `Window [${left}, ${right}] has length ${right - left + 1}; best is ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: 13, left, right: nums.length - 1, zeros, best, nums, message: `Answer: ${best}.` })
  return { input: { nums }, result: best, frames }
}
