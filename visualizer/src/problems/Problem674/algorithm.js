export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000000)) throw new Error('Enter a non-empty JSON array of up to 10,000 integers.')
  return nums
}

// A window [l, r] always holds a strictly increasing run. When nums[r] does not exceed nums[r - 1], the run
// restarts at r; otherwise the window grows. The best window length is the answer.
export function buildTrace(nums) {
  let best = 1
  let l = 0
  const frames = [{ phase: 'start', l: 0, r: 0, best, activeLine: L('let best = 1'), pythonLine: P('best = 1'), message: 'A single value is an increasing run of length 1.' }]
  for (let r = 1; r < nums.length; r++) {
    if (nums[r] <= nums[r - 1]) {
      l = r
      frames.push({ phase: 'reset', l, r, best, activeLine: L('if (nums[r] <= nums[r - 1])'), pythonLine: P('if nums[r] <= nums[r - 1]'), message: `${nums[r]} does not exceed ${nums[r - 1]}: the run restarts at index ${r}.` })
    } else {
      frames.push({ phase: 'grow', l, r, best, activeLine: L('if (nums[r] <= nums[r - 1])'), pythonLine: P('if nums[r] <= nums[r - 1]'), message: `${nums[r]} > ${nums[r - 1]}: the window grows to length ${r - l + 1}.` })
    }
    best = Math.max(best, r - l + 1)
    frames.push({ phase: 'best', l, r, best, activeLine: L('best = Math.max'), pythonLine: P('best = max(best'), message: `Window ${l}…${r} has length ${r - l + 1}; best is now ${best}.` })
  }
  frames.push({ phase: 'done', l, r: nums.length - 1, best, result: best, activeLine: L('return best'), pythonLine: P('return best'), message: `Longest continuous increasing run: ${best}.` })
  return { input: nums, result: best, frames }
}

const SOURCE = `function findLengthOfLCIS(nums) {
  let best = 1
  let start = 0
  for (let r = 1; r < nums.length; r++) {
    if (nums[r] <= nums[r - 1]) start = r
    best = Math.max(best, r - start + 1)
  }
  return best
}`
export const code = SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_length_of_lcis(nums):
    best = 1
    start = 0
    for r in range(1, len(nums)):
        if nums[r] <= nums[r - 1]:
            start = r
        best = max(best, r - start + 1)
    return best`
const P = s => python.split('\n').findIndex(t => t.includes(s)) + 1
