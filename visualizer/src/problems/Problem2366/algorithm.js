export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with a nums key.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('nums needs 1 to 12 values.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('Values are integers from 1 to 50.')
  return { nums }
}

export function buildTrace(input) {
  const { nums } = input
  const n = nums.length
  let prev = nums[n - 1]
  let ops = 0
  const frames = [{ phase: 'start', activeLine: L('set ops to 0'), index: n - 1, prev, ops, message: `The last value ${prev} is the bound for the value before it.` }]
  for (let i = n - 2; i >= 0; i--) {
    const x = nums[i]
    if (x > prev) {
      const parts = Math.ceil(x / prev)
      ops += parts - 1
      prev = Math.floor(x / parts)
      frames.push({ phase: 'split', activeLine: L('set parts to'), index: i, parts, prev, ops, message: `${x} is above the bound; split it into ${parts} parts whose smallest is ${prev}.` })
    } else {
      prev = x
      frames.push({ phase: 'keep', activeLine: L('otherwise set prev to x'), index: i, parts: 1, prev, ops, message: `${x} already fits; it becomes the bound ${prev}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ops'), index: -1, parts: 0, prev, ops, message: `Minimum replacements: ${ops}.` })
  return { input, result: ops, frames }
}

export const code = `minimum replacements to make the array non-decreasing:
  set ops to 0 and prev to the last value
  for each earlier value x from right to left
    if x is greater than prev then
      set parts to x divided by prev, rounded up
      add parts minus one to ops
      set prev to x divided by parts, rounded down
    otherwise set prev to x
  return ops`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_replacements(nums):
    ops = 0
    prev = nums[-1]
    for x in reversed(nums[:-1]):
        if x > prev:
            parts = -(-x // prev)
            ops += parts - 1
            prev = x // parts
        else:
            prev = x
    return ops
`
