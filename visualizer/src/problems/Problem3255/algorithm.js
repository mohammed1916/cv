export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use an object with an integer array nums and an integer k.')
  if (input.nums.length < 1 || input.nums.length > 40) throw new Error('nums must have 1 to 40 entries.')
  if (input.nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each entry of nums is an integer from 1 to 50.')
  if (input.k < 1 || input.k > input.nums.length) throw new Error('k must be from 1 up to the length of nums.')
  return { nums: input.nums, k: input.k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  const results = []
  let run = 0
  frames.push({ phase: 'start', activeLine: L('set run to 0'), at: -1, run, results: [], message: 'No values scanned yet. The run of consecutive rising values is empty.' })
  for (let i = 0; i < nums.length; i++) {
    if (i > 0 && nums[i] === nums[i - 1] + 1) run++
    else run = 1
    frames.push({ phase: 'scan', activeLine: L('if the value is exactly one more'), at: i, run, results: [...results], message: `Value ${nums[i]} at ${i}: the run ending here has length ${run}.` })
    if (i >= k - 1) {
      results.push(run >= k ? nums[i] : -1)
      frames.push({ phase: 'record', activeLine: L('if run is at least k'), at: i, run, results: [...results], message: run >= k ? `The window ending at ${i} is a run, so its power is ${nums[i]}.` : `The window ending at ${i} is not a long enough run, so its power is -1.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return results'), at: -1, run, results: [...results], message: `Powers: [${results.join(', ')}].` })
  return { input: { nums, k }, result: results, frames }
}

export const code = `find the power of each k-size subarray (nums, k):
  set results to empty
  set run to 0
  for each position i in nums
    if the value is exactly one more than the value before it then add 1 to run
    otherwise set run to 1
    if i is at least k minus 1 then
      if run is at least k then append nums[i] to results
      otherwise append -1 to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def subarray_powers(nums, k):
    results = []
    run = 0
    for i, value in enumerate(nums):
        if i > 0 and value == nums[i - 1] + 1:
            run += 1
        else:
            run = 1
        if i >= k - 1:
            results.append(value if run >= k else -1)
    return results
`
