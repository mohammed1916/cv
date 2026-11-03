export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Use a list of 1 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Each value is an integer from 1 to 20.')
  return nums
}

export function buildTrace(nums) {
  const n = nums.length
  const frames = []
  let ops = 0
  for (;;) {
    const start = 3 * ops
    frames.push({ pythonLine: pyAt('rest = '), phase: 'window', activeLine: codeAt('take the rest'), start, at: -1, ops, message: start >= n ? 'Nothing is left, so the array is empty.' : `After ${ops} operation${ops === 1 ? '' : 's'}, the rest starts at index ${start}.` })
    if (start >= n) break
    const seen = new Set()
    let dup = false
    for (let i = start; i < n; i++) {
      if (seen.has(nums[i])) {
        dup = true
        frames.push({ pythonLine: pyAt('return ops'), phase: 'dup', activeLine: codeAt('if a value repeats'), start, at: i, ops, message: `Value ${nums[i]} repeats at index ${i}; remove three more.` })
        break
      }
      seen.add(nums[i])
      frames.push({ pythonLine: pyAt('if len(rest)'), phase: 'scan', activeLine: codeAt('if a value repeats'), start, at: i, ops, message: `Value ${nums[i]} is new so far.` })
    }
    if (!dup) break
    ops++
  }
  frames.push({ pythonLine: pyAt('return ops'), phase: 'done', activeLine: codeAt('return the count'), start: -1, at: -1, ops, message: `Stop after ${ops} operation${ops === 1 ? '' : 's'}.` })
  return { input: nums, result: ops, frames }
}

export const code = `count the operations until the rest has no repeats
  ops is 0
  loop
    rest is the array after removing the first 3 times ops elements
    if rest has no repeated value then stop
    otherwise add 1 to ops
  return the count`.split('\n').map((text, index) => ({ line: index + 1, text }))

const codeAt = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    ops = 0
    while True:
        rest = nums[3 * ops:]
        if len(rest) == len(set(rest)):
            return ops
        ops += 1
`
const pyAt = s => python.split('\n').findIndex(l => l.includes(s)) + 1
