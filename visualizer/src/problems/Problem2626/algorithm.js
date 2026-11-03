export const code = [
  'set the accumulator to init',
  'for each number in nums in order',
  'the accumulator becomes twice the accumulator plus the number',
  'return the accumulator',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.nums) || input.nums.length > 8 || !input.nums.every(n => Number.isInteger(n) && Math.abs(n) <= 9)) throw new Error('nums has at most 8 whole numbers from -9 to 9.')
  if (!Number.isInteger(input.init) || Math.abs(input.init) > 9) throw new Error('init is a whole number from -9 to 9.')
  return { nums: input.nums, init: input.init }
}

export function buildTrace({ nums, init }) {
  const frames = []
  let acc = init
  const view = (focus) => ({ title: 'Accumulator', rows: nums.map(n => String(n)), focus, summary: `accumulator ${acc}` })
  step(frames, 'start', 'set the accumulator', `Accumulator starts at ${acc}.`, view(-1))
  for (let i = 0; i < nums.length; i++) {
    const next = acc * 2 + nums[i]
    step(frames, 'step', 'for each number', `Element ${nums[i]} at index ${i}.`, view(i))
    acc = next
    step(frames, 'step', 'the accumulator becomes', `${acc} after combining ${nums[i]}.`, view(i))
  }
  step(frames, 'done', 'return the accumulator', `Result ${acc}.`, view(-1))
  return { result: acc, frames }
}
