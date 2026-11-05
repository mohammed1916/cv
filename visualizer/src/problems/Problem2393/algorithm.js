export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 14) throw new Error('nums has 1 to 14 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('Each value is an integer from 1 to 9.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let run = 0
  let count = 0
  for (let r = 0; r < nums.length; r++) {
    run = r > 0 && nums[r] > nums[r - 1] ? run + 1 : 1
    count += run
    const l = r - run + 1
    frames.push({ phase: run > 1 ? 'grow' : 'restart', activeLine: CL('run = r > 0'), pythonLine: PL('run = run + 1'), r, l, count, message: run > 1 ? `${nums[r]} is larger than ${nums[r - 1]}, so the increasing run reaches back to ${l}: ${run} subarrays end at ${r}.` : `${nums[r]} does not extend the increase, so a new run starts here: 1 subarray ends at ${r}.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), r: -1, l: -1, count, message: `${count} strictly increasing subarrays.` })
  return { input: { nums }, result: count, frames }
}

export const code = `function countIncreasingSubarrays(nums) {
  let count = 0;
  let run = 0;
  for (let r = 0; r < nums.length; r++) {
    run = r > 0 && nums[r] > nums[r - 1] ? run + 1 : 1;
    count += run;
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_increasing_subarrays(nums):
    count = 0
    run = 0
    for r in range(len(nums)):
        run = run + 1 if r > 0 and nums[r] > nums[r - 1] else 1
        count += run
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
