export const phases = [
  { id: 'start', label: 'Two states', description: 'Track the best alternating sum ending with a plus sign and ending with a minus sign.' },
  { id: 'plus', label: 'Plus sign', description: 'Starting a new subarray here gives +x; extending a minus-ending subarray also gives +x.' },
  { id: 'minus', label: 'Minus sign', description: 'Only a plus-ending subarray can be extended with -x, because the first element must be added.' },
  { id: 'done', label: 'Result', description: 'The answer is the largest value seen in either state.' },
]

export const code = `function maximumAlternatingSubarraySum(nums) {
  let plusEnd = -Infinity
  let minusEnd = -Infinity
  let best = -Infinity
  for (const x of nums) {
    const nextPlus = Math.max(x, minusEnd + x)
    const nextMinus = plusEnd - x
    plusEnd = nextPlus
    minusEnd = nextMinus
    best = Math.max(best, plusEnd, minusEnd)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_alternating_subarray_sum(nums):
    plus_end = float('-inf')
    minus_end = float('-inf')
    best = float('-inf')
    for x in nums:
        next_plus = max(x, minus_end + x)
        next_minus = plus_end - x
        plus_end = next_plus
        minus_end = next_minus
        best = max(best, plus_end, minus_end)
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [3,-1,1,2].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 60) throw new Error('nums must have 1 to 60 values here.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100000)) throw new Error('Each value must be a whole number between -100000 and 100000.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  let plusEnd = -Infinity
  let minusEnd = -Infinity
  let best = -Infinity
  const show = v => (v === -Infinity ? 'none' : v)
  const add = (phase, c, p, message, index) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { nums, index, plusEnd: show(plusEnd), minusEnd: show(minusEnd), best: show(best) },
  })
  add('start', 'let plusEnd', 'plus_end = float', 'No subarray has been started.', -1)
  nums.forEach((x, i) => {
    const nextPlus = Math.max(x, minusEnd + x)
    const nextMinus = plusEnd - x
    plusEnd = nextPlus
    minusEnd = nextMinus
    best = Math.max(best, plusEnd, minusEnd)
    add('plus', 'const nextPlus', 'next_plus = max', `Value ${x} at index ${i}: best plus-ending sum ${show(plusEnd)}, minus-ending ${show(minusEnd)}.`, i)
  })
  add('done', 'return best', 'return best', `Maximum alternating subarray sum: ${best}.`, nums.length - 1)
  return { input: nums, result: best, frames }
}
