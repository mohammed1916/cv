export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 3 || obj.nums.length > 12) throw new Error('Use 3 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Values are integers from 1 to 1000000000.')
  return { nums: obj.nums }
}

export function buildTrace(input) {
  const { nums } = input
  let best = 2
  let run = 2
  const frames = [{ phase: 'start', activeLine: L('set best to 2'), index: 1, run, best, message: 'Any two neighbours form a run of length 2, so start with 2.' }]
  for (let i = 2; i < nums.length; i++) {
    if (nums[i] === nums[i - 1] + nums[i - 2]) {
      run += 1
      frames.push({ phase: 'extend', activeLine: L('add 1 to run'), index: i, run, best: Math.max(best, run), message: `${nums[i]} is ${nums[i - 1]} + ${nums[i - 2]}, so the run grows to ${run}.` })
    } else {
      run = 2
      frames.push({ phase: 'reset', activeLine: L('reset run'), index: i, run, best, message: `${nums[i]} is not ${nums[i - 1]} + ${nums[i - 2]}, so the run restarts at 2.` })
    }
    if (run > best) best = run
    frames.push({ phase: 'compare', activeLine: L('if run is greater'), index: i, run, best, message: `Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, run, best, message: `Longest Fibonacci subarray: ${best}.` })
  return { input, result: best, frames }
}

export const code = `longest Fibonacci run in nums:
  set best to 2
  set run to 2
  for each index i from 2 to the last index:
    if nums[i] equals nums[i - 1] plus nums[i - 2] then
      add 1 to run
    otherwise
      reset run to 2
    if run is greater than best then
      set best to run
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_fibonacci_subarray(nums):
    best = 2
    run = 2
    for i in range(2, len(nums)):
        if nums[i] == nums[i - 1] + nums[i - 2]:
            run += 1
        else:
            run = 2
        if run > best:
            best = run
    return best
`
