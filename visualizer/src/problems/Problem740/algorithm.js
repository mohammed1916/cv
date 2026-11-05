export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Enter 1–12 integers from 1 to 20.')
  return nums
}

const JS_LINES = [
  'function deleteAndEarn(nums) {',
  '  const maxValue = Math.max(...nums)',
  '  const points = new Array(maxValue + 1).fill(0) // points[v] = v times how often v appears',
  '  for (const v of nums) points[v] += v',
  '  let takenPrevious = 0, skippedPrevious = 0 // best totals up to v - 1 and v - 2 (the step before)',
  '  for (let v = 1; v <= maxValue; v++) {',
  '    const skip = Math.max(skippedPrevious, takenPrevious) // skip v: keep the best so far',
  '    const take = skippedPrevious + points[v] // take v: the value just before must be skipped',
  '    skippedPrevious = skip',
  '    takenPrevious = take',
  '  }',
  '  return Math.max(takenPrevious, skippedPrevious) // return the best total',
  '}',
]
const PY_LINES = [
  'def delete_and_earn(nums):',
  '    max_value = max(nums)',
  '    points = [0] * (max_value + 1)',
  '    for v in nums:',
  '        points[v] += v',
  '    take, skip = 0, 0',
  '    for v in range(1, max_value + 1):',
  '        new_skip = max(skip, take)',
  '        new_take = skip + points[v]',
  '        skip, take = new_skip, new_take',
  '    return max(take, skip)',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Deleting x earns x times its count, and deletes x - 1 and x + 1. So the values form a line: choose values with no two neighbours.
export function buildTrace(nums) {
  const maxValue = Math.max(...nums)
  const points = new Array(maxValue + 1).fill(0)
  for (const v of nums) points[v] += v
  let takenPrevious = 0, skippedPrevious = 0
  const rows = []
  const frames = [{ phase: 'start', v: 0, points: [...points], rows: [], activeLine: L('const points'), pythonLine: P('points = [0]'), message: `Each value v earns v times its count. The largest value is ${maxValue}.` }]
  for (let v = 1; v <= maxValue; v++) {
    const skip = Math.max(skippedPrevious, takenPrevious)
    const take = skippedPrevious + points[v]
    const taken = take > skip
    skippedPrevious = skip
    takenPrevious = take
    rows.push({ v, points: points[v], take, skip, choice: points[v] === 0 ? '–' : taken ? 'take' : 'skip' })
    frames.push({ phase: points[v] === 0 ? 'empty' : taken ? 'take' : 'skip', v, points: [...points], rows: rows.map(r => ({ ...r })), activeLine: L(taken ? 'const take' : 'const skip'), pythonLine: P(taken ? 'new_take =' : 'new_skip ='),
      message: points[v] === 0 ? `${v} does not appear, so the running totals carry forward.` : taken ? `Take ${v} (earns ${points[v]}): the value ${v - 1} is given up, giving ${take}.` : `Skip ${v}: keeping the best total so far, ${skip}.` })
  }
  const result = Math.max(takenPrevious, skippedPrevious)
  frames.push({ phase: 'done', v: maxValue, points: [...points], rows: rows.map(r => ({ ...r })), result, activeLine: L('return Math.max'), pythonLine: P('return max(take, skip)'), message: `Best total: ${result}.` })
  return { input: nums, result, frames }
}
