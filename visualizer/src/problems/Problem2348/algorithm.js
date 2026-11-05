export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 16) throw new Error('nums has 1 to 16 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= -3 && x <= 3)) throw new Error('Each value is an integer from -3 to 3.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  let run = 0
  let count = 0
  for (let r = 0; r < nums.length; r++) {
    run = nums[r] === 0 ? run + 1 : 0
    count += run
    frames.push({ phase: run ? 'zero' : 'break', activeLine: CL('run = x === 0'), pythonLine: PL('run = run + 1'), r, l: run ? r - run + 1 : -1, count, message: run ? `${nums[r]} at ${r} is zero. The zero run ending here has length ${run}, adding ${run} subarray${run === 1 ? '' : 's'}.` : `${nums[r]} at ${r} is not zero, so the run restarts and adds nothing.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return count'), pythonLine: PL('return count'), r: -1, l: -1, count, message: `${count} zero-filled subarrays.` })
  return { input: { nums }, result: count, frames }
}

export const code = `function countZeroFilledSubarrays(nums) {
  let count = 0;
  let run = 0;
  for (const x of nums) {
    run = x === 0 ? run + 1 : 0;
    count += run;
  }
  return count;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def count_zero_filled_subarrays(nums):
    count = 0
    run = 0
    for x in nums:
        run = run + 1 if x == 0 else 0
        count += run
    return count
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
