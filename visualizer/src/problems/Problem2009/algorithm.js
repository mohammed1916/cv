export const phases = [
  { id: 'start', label: 'Distinct sorted', description: 'Keep one copy of each value, sorted, because duplicates must be replaced.' },
  { id: 'window', label: 'Window of length n', description: 'The window from l to r covers values no wider than n; the values inside can stay in place.' },
  { id: 'move', label: 'Advance l', description: 'Move l to the next value and let r catch up to keep the window within n.' },
  { id: 'done', label: 'Result', description: 'Replace everything outside the best window.' },
]

export const code = `function minOperations(nums) {
  const n = nums.length
  const values = [...new Set(nums)].sort((a, b) => a - b)
  let best = n
  let right = 0
  for (let left = 0; left < values.length; left++) {
    while (right < values.length && values[right] <= values[left] + n - 1) right++
    best = Math.min(best, n - (right - left))
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_operations(nums):
    n = len(nums)
    values = sorted(set(nums))
    best = n
    right = 0
    for left in range(len(values)):
        while right < len(values) and values[right] <= values[left] + n - 1:
            right += 1
        best = min(best, n - (right - left))
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

export function parseInput(text) {
  let nums
  try { nums = JSON.parse(text) } catch { throw new Error('Use a JSON array such as [4,2,5,3].') }
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 30) throw new Error('nums must have 1 to 30 values here.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value must be a whole number from 1 to 100.')
  return nums
}

export function buildTrace(nums) {
  const frames = []
  const n = nums.length
  const values = [...new Set(nums)].sort((a, b) => a - b)
  let best = n
  let bestWindow = [0, 0]
  let right = 0
  const add = (phase, c, p, message, l, r, count) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { values, l, r, count, best, bestWindow, n },
  })
  add('start', 'const values', 'values = sorted', `Distinct sorted values: ${values.join(', ')}.`, -1, -1, 0)
  for (let left = 0; left < values.length; left++) {
    while (right < values.length && values[right] <= values[left] + n - 1) right++
    const count = right - left
    if (n - count < best) { best = n - count; bestWindow = [left, right - 1] }
    add('window', 'while (right < values.length', 'while right < len(values)', `Window from ${values[left]} to ${values[right - 1]} keeps ${count} values, so ${n - count} must be replaced.`, left, right - 1, count)
    add('move', 'for (let left', 'for left in range', `Next window starts after ${values[left]}.`, left, right - 1, count)
  }
  add('done', 'return best', 'return best', `Minimum replacements: ${best}.`, bestWindow[0], bestWindow[1], best)
  return { input: nums, result: best, frames }
}
