export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a nums array.')
  if (input.nums.length < 1 || input.nums.length > 12 || !input.nums.every(v => Number.isInteger(v) && v >= 1 && v <= 30)) throw new Error('nums has 1 to 12 integers from 1 to 30.')
  return { nums: input.nums }
}

// nums[i] > average of the suffix after i  <=>  nums[i] * count > suffix sum (count > 0).
export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let suffix = 0
  let count = 0
  const dominant = Array(n).fill(false)
  for (let i = n - 1; i >= 0; i--) {
    if (i === n - 1) {
      frames.push({ pythonLine: P('suffix = 0'), phase: 'scan', activeLine: C('for (let i = n - 1'), at: i, suffix, length: 0, dominant: false, count,
        message: 'The rightmost element is never dominant; nothing lies after it.' })
    } else {
      const after = n - 1 - i
      const isDominant = nums[i] * after > suffix
      if (isDominant) count++
      dominant[i] = isDominant
      frames.push({ pythonLine: P('if nums[i] * after'), phase: 'scan', activeLine: C('if (nums[i] * after'), at: i, suffix, length: after, dominant: isDominant, count,
        message: `Index ${i}: ${nums[i]} × ${after} is ${nums[i] * after} and the suffix sum is ${suffix}; ${isDominant ? 'dominant' : 'not dominant'}.` })
    }
    suffix += nums[i]
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: C('return count'), at: -1, suffix, length: 0, dominant: false, count,
    message: `${count} dominant index${count === 1 ? '' : 'es'}.` })
  return { input: { nums }, result: count, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `function countDominantIndices(nums) {
  const n = nums.length
  let suffix = 0
  let count = 0
  for (let i = n - 1; i >= 0; i--) {
    if (i < n - 1) {
      const after = n - 1 - i
      if (nums[i] * after > suffix) count += 1
    }
    suffix += nums[i]
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def count_dominant(nums):
    n = len(nums)
    suffix = 0
    count = 0
    for i in range(n - 1, -1, -1):
        if i < n - 1:
            after = n - 1 - i
            if nums[i] * after > suffix:
                count += 1
        suffix += nums[i]
    return count
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
