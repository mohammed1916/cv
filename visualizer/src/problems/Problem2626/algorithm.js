export const code = [
  'set the accumulator to init',
  'for each number in nums in order',
  'the reducer combines the accumulator with the number',
  'the accumulator takes the reducer result',
  'return the accumulator',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

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
  step(frames, 'start', 'set the accumulator', `Accumulator starts at ${acc}.`, view(-1))
  for (let i = 0; i < nums.length; i++) {
    const before = acc
    step(frames, 'step', 'for each number', `Element ${nums[i]} at index ${i}.`, view(i, { before }))
    acc = reducer.apply(acc, nums[i])
    step(frames, 'step', 'the accumulator takes', `${before} combined with ${nums[i]} gives ${acc}.`, view(i, { before, after: acc }))
  }
  step(frames, 'done', 'return the accumulator', `Result ${acc}.`, view(-1, { done: true }))
  return { result: acc, frames, input: { nums, init, fn } }
}
