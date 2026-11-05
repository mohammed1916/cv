export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('Give nums as an array of 1 to 8 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Each value in nums is an integer from 1 to 50.')
  if (!Number.isInteger(input.threshold) || input.threshold < nums.length || input.threshold > 50) throw new Error('threshold is an integer from the length of nums up to 50.')
  return { nums, threshold: input.threshold }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function smallestDivisor(nums, threshold) {', 'def smallest_divisor(nums, threshold):'],
  ['  let low = 1', '    low = 1'],
  ['  let high = Math.max(...nums)', '    high = max(nums)'],
  ['  while (low < high) {', '    while low < high:'],
  ['    const mid = Math.floor((low + high) / 2)', '        mid = (low + high) // 2'],
  ['    const sum = nums.reduce((acc, v) => acc + Math.floor((v + mid - 1) / mid), 0)', '        total = sum(-(-value // mid) for value in nums)'],
  ['    if (sum <= threshold) {', '        if total <= threshold:'],
  ['      high = mid', '            high = mid'],
  ['    } else {', '        else:'],
  ['      low = mid + 1', '            low = mid + 1'],
  ['    }', ''],
  ['  }', ''],
  ['  return low', '    return low'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace({ nums, threshold }) {
  const frames = []
  let low = 1, high = Math.max(...nums)
  frames.push({ phase: 'start', activeLine: L('let low = 1'), pythonLine: P('low = 1'), low, high, mid: null, sum: null, message: `Try divisors from ${low} to ${high}. A larger divisor never raises the sum.` })
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    const sum = nums.reduce((acc, v) => acc + Math.floor((v + mid - 1) / mid), 0)
    if (sum <= threshold) high = mid
    else low = mid + 1
    frames.push({ phase: 'probe', activeLine: L('if (sum <= threshold)'), pythonLine: P('if total <= threshold'), low, high, mid, sum, message: `Divisor ${mid} gives sum ${sum} ${sum <= threshold ? 'within' : 'above'} ${threshold}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return low'), pythonLine: P('return low'), low, high, mid: null, sum: null, message: `The smallest divisor is ${low}.` })
  return { input: { nums, threshold }, result: low, frames }
}
