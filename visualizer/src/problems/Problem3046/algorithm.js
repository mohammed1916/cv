export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 12 || nums.length % 2 !== 0) throw new Error('Use a JSON array of an even number of integers, 2 to 12.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('Values are integers from 1 to 6.')
  return nums
}

export function buildTrace(nums) {
  const counts = new Map()
  for (const v of nums) counts.set(v, (counts.get(v) ?? 0) + 1)
  const frames = [{ phase: 'count', activeLine: L('counts = how many'), value: null, count: null, message: `Count the values. Each value may appear at most twice to fit in two distinct halves.` }]
  for (const [value, c] of counts) {
    if (c > 2) {
      frames.push({ phase: 'fail', activeLine: L('if c is more than 2'), value, count: c, message: `${value} appears ${c} times, so it would have to appear in one half twice. Answer: false.` })
      frames.push({ phase: 'done', activeLine: L('return false'), value: null, count: null, message: 'The array cannot be split this way.' })
      return { input: nums, result: false, frames }
    }
    frames.push({ phase: 'ok', activeLine: L('if c is more than 2'), value, count: c, message: `${value} appears ${c} time${c === 1 ? '' : 's'}: one copy can go in each half.` })
  }
  frames.push({ phase: 'done', activeLine: L('return true'), value: null, count: null, message: 'Every value appears at most twice, so the split exists.' })
  return { input: nums, result: true, frames }
}

export const code = `can the array split into two halves with distinct values
  counts = how many times each value appears
  for each value with count c
    if c is more than 2 then
      return false
  return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def can_split_into_distinct_halves(nums):
    return all(c <= 2 for c in Counter(nums).values())
`
