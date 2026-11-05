export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 7)) throw new Error('Each value is an integer from 1 to 7.')
  return { nums }
}

export function buildTrace({ nums }) {
  const top = Math.max(...nums)
  const frames = []
  let best = 0
  let run = 0
  let start = 0
  let bestStart = 0
  frames.push({ phase: 'setup', activeLine: CL('const top ='), pythonLine: PL('top = max'), i: -1, l: -1, r: -1, best, bestStart, message: `The largest AND of any subarray is the largest value, ${top}, taken alone.` })
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === top) {
      if (run === 0) start = i
      run++
    } else {
      run = 0
    }
    if (run > best) { best = run; bestStart = start }
    frames.push({ phase: run ? 'extend' : 'break', activeLine: CL('run = x === top'), pythonLine: PL('run = run + 1'), i, l: run ? start : -1, r: i, best, bestStart, message: run ? `${nums[i]} is the top value, so the run of ${top} reaches length ${run}.` : `${nums[i]} is below ${top}, so the run ends.` })
  }
  frames.push({ phase: 'done', activeLine: CL('return best'), pythonLine: PL('return best'), i: -1, l: -1, r: -1, best, bestStart, message: `The longest subarray with the top AND has length ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function longestMaxAndSubarray(nums) {
  const top = Math.max(...nums);
  let best = 0;
  let run = 0;
  for (const x of nums) {
    run = x === top ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def longest_max_and_subarray(nums):
    top = max(nums)
    best = 0
    run = 0
    for x in nums:
        run = run + 1 if x == top else 0
        best = max(best, run)
    return best
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
