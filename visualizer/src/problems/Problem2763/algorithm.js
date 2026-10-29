export const code = [
  { line: 1, text: "n = length of nums" },
  { line: 2, text: "total = 0" },
  { line: 3, text: "for each start i from 0 to n - 1" },
  { line: 4, text: "reset seen, distinct, and adjacent" },
  { line: 5, text: "for each end j from i to n - 1" },
  { line: 6, text: "value = nums[j]" },
  { line: 7, text: "if value is new, add it and update distinct and adjacent" },
  { line: 8, text: "total += max(0, distinct - 1 - adjacent)" },
  { line: 9, text: "return total" },
]

export const python = `def sumImbalanceNumbers(nums):
    n = len(nums)
    total = 0
    for i in range(n):
        seen = set()
        distinct = 0
        adjacent = 0
        for j in range(i, n):
            value = nums[j]
            if value not in seen:
                distinct += 1
                adjacent += (value - 1 in seen) + (value + 1 in seen)
                seen.add(value)
            total += max(0, distinct - 1 - adjacent)
    return total`

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object with an array nums, for example {"nums":[2,3,1,4]}.')
  if (data.nums.length < 1 || data.nums.length > 20) throw new Error('nums must have 1 to 20 values for this visualization.')
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > data.nums.length)) throw new Error('nums values must be integers from 1 to the length of nums.')
  return { nums: [...data.nums] }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let total = 0
  frames.push({ phase: 'setup', activeLine: 1, pythonLine: 2, i: -1, j: -1, value: null, distinct: 0, adjacent: 0, total, window: [], message: `The array has ${n} values.` })
  frames.push({ phase: 'setup', activeLine: 2, pythonLine: 3, i: -1, j: -1, value: null, distinct: 0, adjacent: 0, total, window: [], message: 'Start the running total at 0.' })
  for (let i = 0; i < n; i++) {
    const seen = new Set()
    let distinct = 0
    let adjacent = 0
    frames.push({ phase: 'start', activeLine: 4, pythonLine: 5, i, j: i, value: null, distinct, adjacent, total, window: [], message: `Start subarrays at index ${i} with no values seen.` })
    for (let j = i; j < n; j++) {
      const value = nums[j]
      frames.push({ phase: 'extend', activeLine: 6, pythonLine: 9, i, j, value, distinct, adjacent, total, window: [i, j], message: `Extend the subarray to index ${j}, reading ${value}.` })
      if (!seen.has(value)) {
        distinct += 1
        adjacent += (seen.has(value - 1) ? 1 : 0) + (seen.has(value + 1) ? 1 : 0)
        seen.add(value)
        frames.push({ phase: 'add', activeLine: 7, pythonLine: 11, i, j, value, distinct, adjacent, total, window: [i, j], message: `${value} is new. Distinct values ${distinct}, adjacent pairs ${adjacent}.` })
      }
      const gaps = Math.max(0, distinct - 1 - adjacent)
      total += gaps
      frames.push({ phase: 'count', activeLine: 8, pythonLine: 14, i, j, value, distinct, adjacent, total, window: [i, j], message: `This subarray has imbalance ${gaps}. Running total ${total}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: 9, pythonLine: 15, i: -1, j: -1, value: null, distinct: 0, adjacent: 0, total, window: [], result: total, message: `Return the total ${total}.` })
  return { input: { nums }, result: total, frames }
}
