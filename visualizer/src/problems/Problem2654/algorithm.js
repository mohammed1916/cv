const MAX_LENGTH = 10
const MAX_VALUE = 60

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[2,6,3,4]}.')
  if (data.nums.length < 1 || data.nums.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums }) {
  const n = nums.length
  const ones = nums.filter(v => v === 1).length
  const frames = [{ phase: 'ones', activeLine: L('if ones is more than 0'), i: -1, j: -1, best: null, message: `${ones} element(s) already equal 1.` }]
  if (ones > 0) {
    const result = n - ones
    frames.push({ phase: 'done', activeLine: L('return n - ones'), i: -1, j: -1, best: null, message: `Each other element needs one operation: ${result}.` })
    return { input: { nums }, result, frames }
  }
  let best = null
  for (let i = 0; i < n; i++) {
    let g = 0
    for (let j = i; j < n; j++) {
      g = gcd(g, nums[j])
      if (g === 1) {
        const length = j - i + 1
        if (best === null || length < best) best = length
        frames.push({ phase: 'window', activeLine: L('if g equals 1'), i, j, best, message: `Subarray ${i} to ${j} has gcd 1 with length ${length}.` })
        break
      }
    }
  }
  const result = best === null ? -1 : best - 1 + n - 1
  frames.push({ phase: 'done', activeLine: L('return best - 1'), i: -1, j: -1, best, message: result === -1 ? 'No subarray has gcd 1, so it is impossible.' : `Shortest gcd-1 subarray ${best}: ${best - 1} + ${n - 1} operations.` })
  return { input: { nums }, result, frames }
}

export const code = `minimum operations to make every element 1
  set ones to the count of elements equal to 1
  if ones is more than 0 then return n - ones
  set best to nothing
  for each start index i
    set g to 0
    for each end index j from i up to n - 1
      set g to gcd(g, nums[j])
      if g equals 1 then
        if best is unset or j - i + 1 is less than best then set best to j - i + 1
        stop extending from i
  if best is unset then return -1
  return best - 1 + n - 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations(nums):
    from math import gcd
    n = len(nums)
    ones = nums.count(1)
    if ones > 0:
        return n - ones
    best = None
    for i in range(n):
        g = 0
        for j in range(i, n):
            g = gcd(g, nums[j])
            if g == 1:
                length = j - i + 1
                if best is None or length < best:
                    best = length
                break
    if best is None:
        return -1
    return best - 1 + n - 1
`
