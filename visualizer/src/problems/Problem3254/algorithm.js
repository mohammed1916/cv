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
  for (let start = 0; start + k <= nums.length; start++) {
    const window = nums.slice(start, start + k)
    let run = true
    for (let j = 0; j + 1 < k; j++) {
      if (window[j + 1] !== window[j] + 1) { run = false; break }
    }
    frames.push({ phase: 'check', activeLine: L('for each adjacent pair'), left: start, right: start + k - 1, run, results: [...results], message: run ? `Window at ${start} rises by exactly 1 at every step.` : `Window at ${start} breaks the run of consecutive values.` })
    results.push(run ? window[k - 1] : -1)
    frames.push({ phase: 'record', activeLine: L('append'), left: start, right: start + k - 1, run, results: [...results], message: `Power of this window: ${results[results.length - 1]}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return results'), left: nums.length - k, right: nums.length - 1, run: null, results: [...results], message: `Powers: [${results.join(', ')}].` })
  return { input: { nums, k }, result: results, frames }
}

export const code = `find the power of each k-size subarray (nums, k):
  set results to empty
  for each start from 0 to the length of nums minus k
    set run to true
    for each adjacent pair in the window
      if the next value is not exactly one more than the value before then set run to false
    if run then append the last value of the window to results
    otherwise append -1 to results
  return results`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def subarray_powers(nums, k):
    results = []
    for start in range(len(nums) - k + 1):
        window = nums[start:start + k]
        run = all(window[i + 1] == window[i] + 1 for i in range(k - 1))
        results.append(window[-1] if run else -1)
    return results
`
