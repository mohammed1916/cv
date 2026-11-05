export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 30) throw new Error('nums has 2 to 30 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -100 && v <= 100)) throw new Error('Each value is an integer from -100 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const runs = []
  let best = 0
  frames.push({ pythonLine: PY('runs = []'), phase: 'start', activeLine: L('const runs = []'), focus: [], best, message: `Split ${n} values into maximal strictly increasing runs.` })
  let start = 0
  for (let i = 1; i <= n; i++) {
    if (i === n || nums[i] <= nums[i - 1]) {
      runs.push({ start, length: i - start })
      frames.push({ pythonLine: PY('runs.append'), phase: 'run', activeLine: L('runs.push(i - start)'), focus: [[start, i]], best,
        message: `Run from index ${start} has length ${i - start}.` })
      start = i
    }
  }
  for (const run of runs) {
    best = Math.max(best, Math.floor(run.length / 2))
    frames.push({ pythonLine: PY('best = max(best, length // 2)'), phase: 'half', activeLine: L('for (const length of runs)'), focus: [[run.start, run.start + run.length]], best,
      message: `Two halves of a run of length ${run.length} give ${Math.floor(run.length / 2)}.` })
  }
  for (let j = 0; j + 1 < runs.length; j++) {
    const a = runs[j], b = runs[j + 1]
    best = Math.max(best, Math.min(a.length, b.length))
    frames.push({ pythonLine: PY('best = max(best, min(a, b))'), phase: 'pair', activeLine: L('Math.min(runs[j], runs[j + 1])'), focus: [[a.start, a.start + a.length], [b.start, b.start + b.length]], best,
      message: `Adjacent runs of lengths ${a.length} and ${b.length} allow k = ${Math.min(a.length, b.length)}.` })
  }
  frames.push({ pythonLine: PY('return best'), phase: 'done', activeLine: L('return best'), focus: [], best, result: best, message: `The largest k is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `function maxIncreasingSubarrays(nums) {
  const runs = []
  let start = 0
  for (let i = 1; i <= nums.length; i++) {
    if (i === nums.length || nums[i] <= nums[i - 1]) {
      runs.push(i - start)
      start = i
    }
  }
  let best = 0
  for (const length of runs) best = Math.max(best, Math.floor(length / 2))
  for (let j = 0; j + 1 < runs.length; j++) best = Math.max(best, Math.min(runs[j], runs[j + 1]))
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_increasing_subarrays(nums):
    runs = []
    start = 0
    for i in range(1, len(nums) + 1):
        if i == len(nums) or nums[i] <= nums[i - 1]:
            runs.append(i - start)
            start = i
    best = 0
    for length in runs:
        best = max(best, length // 2)
    for a, b in zip(runs, runs[1:]):
        best = max(best, min(a, b))
    return best
`
const PY = s => python.split('\n').findIndex(line => line.includes(s)) + 1
