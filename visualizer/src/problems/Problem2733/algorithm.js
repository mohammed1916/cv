export const code = [
  { line: 1, text: "lo = smallest value in nums" },
  { line: 2, text: "hi = largest value in nums" },
  { line: 3, text: "for each x in nums" },
  { line: 4, text: "if x is neither lo nor hi" },
  { line: 5, text: "return x" },
  { line: 6, text: "return -1" },
]

export const python = `def findNeitherMinNorMax(nums):
    lo = min(nums)
    hi = max(nums)
    for x in nums:
        if x != lo and x != hi:
            return x
    return -1`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with an array nums, for example {"nums":[3,2,1,4]}.')
  if (data.nums.length < 1 || data.nums.length > 100) throw new Error('nums must have 1 to 100 values.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 100)) throw new Error('nums values must be integers from 1 to 100.')
  if (new Set(data.nums).size !== data.nums.length) throw new Error('nums values must be distinct.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const lo = Math.min(...nums)
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, index: -1, lo, hi: null, message: `The smallest value is ${lo}.` })
  const hi = Math.max(...nums)
  frames.push({ phase: 'setup', activeLine: 2, pythonLine: 3, index: -1, lo, hi, message: `The largest value is ${hi}.` })
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i]
    frames.push({ phase: 'scan', activeLine: 3, pythonLine: 4, index: i, lo, hi, message: `Look at nums[${i}] = ${x}.` })
    const neither = x !== lo && x !== hi
    frames.push({ phase: 'check', activeLine: 4, pythonLine: 5, index: i, lo, hi, message: neither ? `${x} is neither the minimum nor the maximum.` : `${x} is an extreme value, so keep looking.` })
    if (neither) {
      frames.push({ phase: 'done', activeLine: 5, pythonLine: 6, index: i, lo, hi, result: x, message: `Return ${x}.` })
      return { input: { nums }, result: x, frames }
    }
  }
  frames.push({ phase: 'done', activeLine: 6, pythonLine: 7, index: -1, lo, hi, result: -1, message: 'Every value is an extreme value. Return -1.' })
  return { input: { nums }, result: -1, frames }
}
