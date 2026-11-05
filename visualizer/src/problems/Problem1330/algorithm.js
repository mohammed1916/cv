export const inputLabel = 'Array (JSON object with nums, e.g. {"nums":[2,3,1,5,4]})'

export function parseInput(text) {
  let data
  try {
    data = typeof text === 'string' ? JSON.parse(text) : text
  } catch {
    throw new Error('Input must be a JSON object, e.g. {"nums":[2,3,1,5,4]}')
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Input must be a JSON object with a nums array')
  }
  const { nums } = data
  if (!Array.isArray(nums)) throw new Error('nums must be an array of integers')
  if (nums.length < 2) throw new Error('nums needs at least 2 values')
  if (nums.length > 50) throw new Error(`nums has ${nums.length} values; the visualization caps it at 50`)
  nums.forEach((v, i) => {
    if (!Number.isInteger(v) || Math.abs(v) > 100000) {
      throw new Error(`nums[${i}] must be an integer with absolute value at most 100000`)
    }
  })
  return { nums: [...nums] }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function maxValueAfterReverse(nums) {', 'def max_value_after_reverse(nums):'],
  ['  const n = nums.length', '    n = len(nums)'],
  ['  let base = 0; for (let i = 0; i < n - 1; i++) base += Math.abs(nums[i] - nums[i + 1])', '    base = sum(abs(nums[i] - nums[i + 1]) for i in range(n - 1))'],
  ['  let gain = 0', '    gain = 0'],
  ['  let maxMin = -Infinity', "    max_min = float('-inf')"],
  ['  let minMax = Infinity', "    min_max = float('inf')"],
  ['  for (let i = 0; i < n - 1; i++) {', '    for i in range(n - 1):'],
  ['    gain = Math.max(gain, Math.abs(nums[0] - nums[i + 1]) - Math.abs(nums[i] - nums[i + 1]), Math.abs(nums[n - 1] - nums[i]) - Math.abs(nums[i] - nums[i + 1]))', '        gain = max(gain, abs(nums[0] - nums[i + 1]) - abs(nums[i] - nums[i + 1]), abs(nums[n - 1] - nums[i]) - abs(nums[i] - nums[i + 1]))'],
  ['    maxMin = Math.max(maxMin, Math.min(nums[i], nums[i + 1]))', '        max_min = max(max_min, min(nums[i], nums[i + 1]))'],
  ['    minMax = Math.min(minMax, Math.max(nums[i], nums[i + 1]))', '        min_max = min(min_max, max(nums[i], nums[i + 1]))'],
  ['  }', ''],
  ['  gain = Math.max(gain, 2 * (maxMin - minMax))', '    gain = max(gain, 2 * (max_min - min_max))'],
  ['  return base + gain', '    return base + gain'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = Object.fromEntries(code.map(({ line }) => [line, line]))

export const examples = [
  { label: 'Example 1', input: '{"nums":[2,3,1,5,4]}' },
  { label: 'Example 2', input: '{"nums":[2,4,9,24,2,1,10]}' },
  { label: 'Two values', input: '{"nums":[1,5]}' },
]

export function buildTrace(input) {
  const a = input.nums
  const n = a.length
  const frames = []
  let base = 0
  for (let i = 0; i < n - 1; i++) base += Math.abs(a[i] - a[i + 1])
  frames.push({ phase: 'base', activeLine: L('let base = 0'), pythonLine: P('base = sum'), message: `Base value is ${base}.`, i: -1, base, gain: 0, maxMin: null, minMax: null })
  frames.push({ phase: 'base', activeLine: L('let gain = 0'), pythonLine: P('gain = 0'), message: 'Start with no extra gain.', i: -1, base, gain: 0, maxMin: null, minMax: null })

  let gain = 0
  let maxMin = -Infinity
  let minMax = Infinity
  const shown = (v) => (Number.isFinite(v) ? v : null)
  for (let i = 0; i < n - 1; i++) {
    frames.push({ phase: 'scan', activeLine: L('for (let i = 0; i < n - 1'), pythonLine: P('for i in range(n - 1)'), message: `Check boundary ${i} between nums[${i}] and nums[${i + 1}].`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
    const prefix = Math.abs(a[0] - a[i + 1]) - Math.abs(a[i] - a[i + 1])
    const suffix = Math.abs(a[n - 1] - a[i]) - Math.abs(a[i] - a[i + 1])
    gain = Math.max(gain, prefix, suffix)
    frames.push({ phase: 'scan', activeLine: L('gain = Math.max(gain, Math.abs'), pythonLine: P('gain = max(gain, abs'), message: `End flips at boundary ${i} gain ${prefix} (prefix) or ${suffix} (suffix); best gain is ${gain}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
    maxMin = Math.max(maxMin, Math.min(a[i], a[i + 1]))
    frames.push({ phase: 'scan', activeLine: L('maxMin = Math.max'), pythonLine: P('max_min = max'), message: `Largest lower value of a pair so far is ${maxMin}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
    minMax = Math.min(minMax, Math.max(a[i], a[i + 1]))
    frames.push({ phase: 'scan', activeLine: L('minMax = Math.min'), pythonLine: P('min_max = min'), message: `Smallest upper value of a pair so far is ${minMax}.`, i, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
  }
  const interior = 2 * (maxMin - minMax)
  gain = Math.max(gain, interior)
  frames.push({ phase: 'finish', activeLine: L('gain = Math.max(gain, 2'), pythonLine: P('gain = max(gain, 2'), message: `Interior reversal gains ${interior}; best extra gain is ${gain}.`, i: -1, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
  const result = base + gain
  frames.push({ phase: 'done', activeLine: L('return base + gain'), pythonLine: P('return base + gain'), message: `Maximum array value is ${result}.`, i: -1, base, gain, maxMin: shown(maxMin), minMax: shown(minMax) })
  return { input, result, frames }
}
