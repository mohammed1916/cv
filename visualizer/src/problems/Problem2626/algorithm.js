const CODE = [
  'function reduce(nums, fn, init) {',
  '  let accum = init',
  '  for (let i = 0; i < nums.length; i++) {',
  '    accum = fn(accum, nums[i])',
  '  }',
  '  return accum',
  '}',
]

const PY = [
  'def reduce_nums(nums, fn, init):',
  '    accum = init',
  '    for curr in nums:',
  '        accum = fn(accum, curr)',
  '    return accum',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Set the accumulator to init.' },
  { id: 'step', label: 'Combine', description: 'Combine the accumulator with one element.' },
  { id: 'done', label: 'Result', description: 'The final accumulator.' },
]

// Reducers the visualization offers. Each takes (accumulator, element) and returns the next accumulator.
export const REDUCERS = {
  sum: { label: 'accum + curr', apply: (accum, curr) => accum + curr },
  squareSum: { label: 'accum + curr * curr', apply: (accum, curr) => accum + curr * curr },
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.nums) || input.nums.length > 8 || !input.nums.every(n => Number.isInteger(n) && Math.abs(n) <= 9)) throw new Error('nums has at most 8 whole numbers from -9 to 9.')
  if (!Number.isInteger(input.init) || Math.abs(input.init) > 99) throw new Error('init is a whole number from -99 to 99.')
  const fn = input.fn ?? 'sum'
  if (!Object.hasOwn(REDUCERS, fn)) throw new Error('fn is "sum" (accum + curr) or "squareSum" (accum + curr * curr).')
  return { nums: input.nums, init: input.init, fn }
}

export function buildTrace({ nums, init, fn = 'sum' }) {
  const reducer = REDUCERS[fn]
  const frames = []
  let acc = init
  const view = (focus, extra = {}) => ({ title: 'Accumulator', rows: nums.map(n => String(n)), nums: nums.slice(), focus, accum: acc, formula: reducer.label, done: [], ...extra })
  frames.push({ pythonLine: at(PY, 'accum = init'), activeLine: at(CODE, 'let accum = init'), phase: 'start', message: `Accumulator starts at ${acc}.`, view: view(-1) })
  for (let i = 0; i < nums.length; i++) {
    const before = acc
    frames.push({ pythonLine: at(PY, 'for curr in nums:'), activeLine: at(CODE, 'for (let i = 0; i < nums.length; i++) {'), phase: 'step', message: `Element ${nums[i]} at index ${i}.`, view: view(i, { before }) })
    acc = reducer.apply(acc, nums[i])
    frames.push({ pythonLine: at(PY, 'accum = fn(accum, curr)'), activeLine: at(CODE, 'accum = fn(accum, nums[i])'), phase: 'step', message: `${before} combined with ${nums[i]} gives ${acc}.`, view: view(i, { before, after: acc }) })
  }
  frames.push({ pythonLine: at(PY, 'return accum'), activeLine: at(CODE, 'return accum'), phase: 'done', message: `Result ${acc}.`, view: view(-1, { done: true }) })
  return { result: acc, frames, input: { nums, init, fn } }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
