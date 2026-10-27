const MAX_NUMS = 8
const MAX_DIVIDE = 6
const MAX_VALUE = 50

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums) || !Array.isArray(data.nums_divide)) throw new Error('Use an object like {"nums":[2,3],"nums_divide":[9,6]}.')
  if (data.nums.length < 1 || data.nums.length > MAX_NUMS) throw new Error(`nums has 1 to ${MAX_NUMS} values.`)
  if (data.nums_divide.length < 1 || data.nums_divide.length > MAX_DIVIDE) throw new Error(`nums_divide has 1 to ${MAX_DIVIDE} values.`)
  for (const arr of [data.nums, data.nums_divide]) {
    if (arr.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  }
  return { nums: data.nums, nums_divide: data.nums_divide }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums, nums_divide }) {
  const g = nums_divide.reduce((acc, v) => gcd(acc, v), 0)
  const sorted = [...nums].sort((a, b) => a - b)
  const frames = [{ phase: 'target', activeLine: L('set g to the gcd'), index: -1, g, deletions: 0, message: `The gcd of nums_divide is ${g}.` }]
  let answer = -1
  for (let i = 0; i < sorted.length; i++) {
    if (g % sorted[i] === 0) {
      answer = i
      frames.push({ phase: 'scan', activeLine: L('if v divides g'), index: i, g, deletions: i, message: `${sorted[i]} divides ${g}. Delete the ${i} smaller value(s).` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('add one to deletions'), index: i, g, deletions: i + 1, message: `${sorted[i]} does not divide ${g}. Delete it.` })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), index: -1, g, deletions: answer, message: answer === -1 ? 'No value divides the gcd, so the task is impossible.' : `Minimum deletions: ${answer}.` })
  return { input: { nums, nums_divide }, result: answer, sorted, frames }
}

export const code = `minimum deletions so the smallest kept value divides every target
  set g to the gcd of all values in nums_divide
  sort nums in increasing order
  set deletions to 0
  for each value v in the sorted nums
    if v divides g then return deletions
    add one to deletions
  return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_deletions(nums, nums_divide):
    from math import gcd
    from functools import reduce
    g = reduce(gcd, nums_divide)
    deletions = 0
    for value in sorted(nums):
        if g % value == 0:
            return deletions
        deletions += 1
    return -1
`
