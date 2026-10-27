export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k) || !Number.isInteger(input.x)) throw new Error('Use an object with an integer array nums and integers k and x.')
  if (input.nums.length < 1 || input.nums.length > 40) throw new Error('nums must have 1 to 40 entries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < -50 || v > 50)) throw new Error('Each entry of nums is an integer from -50 to 50.')
  if (input.k < 1 || input.k > input.nums.length) throw new Error('k must be from 1 up to the length of nums.')
  if (input.x < 1 || input.x > input.k) throw new Error('x must be from 1 up to k.')
  return { nums: input.nums, k: input.k, x: input.x }
}

export function buildTrace({ nums, k, x }) {
  const frames = []
  const results = []
  for (let start = 0; start + k <= nums.length; start++) {
    const window = nums.slice(start, start + k)
    const counts = new Array(51).fill(0)
    for (const value of window) if (value < 0) counts[-value]++
    frames.push({ phase: 'count', activeLine: L('count how many times each negative'), left: start, right: start + k - 1, beauty: null, results: [...results], message: `Window starting at ${start}: count its negative values by magnitude.` })
    let seen = 0
    let beauty = 0
    for (let magnitude = 50; magnitude >= 1; magnitude--) {
      seen += counts[magnitude]
      if (seen >= x && beauty === 0) beauty = -magnitude
    }
    results.push(beauty)
    frames.push({ phase: 'pick', activeLine: L('if seen is at least x'), left: start, right: start + k - 1, beauty, results: [...results], message: beauty === 0 ? `Fewer than ${x} negative values, so the beauty is 0.` : `The ${x}-th smallest negative value is ${beauty}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return results'), left: nums.length - k, right: nums.length - 1, beauty: null, results: [...results], message: `Beauty of every window: [${results.join(', ')}].` })
  return { input: { nums, k, x }, result: results, frames }
}

export const code = `sliding subarray beauty (nums, k, x):
  set results to empty
  for each start from 0 to the length of nums minus k
    count how many times each negative value occurs in the window, by magnitude
    set seen to 0 and beauty to 0
    for each magnitude from 50 down to 1, which is the value from -50 up to -1
      add the count of that value to seen
      if seen is at least x and beauty is still 0 then set beauty to that value
    append beauty to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sliding_subarray_beauty(nums, k, x):
    results = []
    for start in range(len(nums) - k + 1):
        counts = [0] * 51
        for value in nums[start:start + k]:
            if value < 0:
                counts[-value] += 1
        seen = 0
        beauty = 0
        for magnitude in range(50, 0, -1):
            seen += counts[magnitude]
            if seen >= x and beauty == 0:
                beauty = -magnitude
        results.append(beauty)
    return results
`
