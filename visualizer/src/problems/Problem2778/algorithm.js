export const code = [
  { line: 1, text: "n = length of nums" },
  { line: 2, text: "total = 0" },
  { line: 3, text: "for i from 1 to n" },
  { line: 4, text: "if n is divisible by i" },
  { line: 5, text: "total += nums[i] squared" },
  { line: 6, text: "return total" },
]

export const python = `def sumOfSquares(nums):
    n = len(nums)
    total = 0
    for i in range(1, n + 1):
        if n % i == 0:
            total += nums[i - 1] ** 2
    return total`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with an array nums, for example {"nums":[2,7,1,19,18,3]}.')
  if (data.nums.length < 1 || data.nums.length > 30) throw new Error('nums must have 1 to 30 values for this visualization.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000)) throw new Error('nums values must be integers from 1 to 1000.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let total = 0
  const special = []
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, index: -1, total, special: [], message: `The array has ${n} values.` })
  frames.push({ phase: 'setup', activeLine: 2, pythonLine: 3, index: -1, total, special: [], message: 'Start the sum at 0.' })
  for (let i = 1; i <= n; i++) {
    frames.push({ phase: 'scan', activeLine: 3, pythonLine: 4, index: i - 1, total, special: [...special], message: `Position ${i} (1-indexed).` })
    const isSpecial = n % i === 0
    frames.push({ phase: 'check', activeLine: 4, pythonLine: 5, index: i - 1, total, special: [...special], message: isSpecial ? `${i} divides ${n}, so nums[${i}] is special.` : `${i} does not divide ${n}.` })
    if (isSpecial) {
      total += nums[i - 1] ** 2
      special.push(i - 1)
      frames.push({ phase: 'add', activeLine: 5, pythonLine: 6, index: i - 1, total, special: [...special], message: `Add ${nums[i - 1]} squared. Total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: 6, pythonLine: 7, index: -1, total, special: [...special], result: total, message: `Return ${total}.` })
  return { input: { nums }, result: total, frames }
}
