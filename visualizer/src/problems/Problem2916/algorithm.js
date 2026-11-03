const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums has 1 to 8 values.')
  for (const v of nums) if (!Number.isInteger(v) || v < 1 || v > 100) throw new Error('Each value is an integer from 1 to 100.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const n = nums.length
  let total = 0
  frames.push({ pythonLine: P('total = 0'), phase: 'start', activeLine: L('set total to 0'), at: -1, left: -1, distinct: 0, total, message: 'Start with a running total of zero.' })
  for (let left = 0; left < n; left++) {
    const seen = new Set()
    frames.push({ pythonLine: P('seen = set()'), phase: 'left', activeLine: L('for each left end'), at: left, left, distinct: 0, total, message: `Subarrays starting at ${left} begin with an empty set of values.` })
    for (let right = left; right < n; right++) {
      seen.add(nums[right])
      total = (total + seen.size ** 2) % MOD
      frames.push({ pythonLine: P('total = (total + len(seen) ** 2) % MOD'), phase: 'extend', activeLine: L('add the square'), at: right, left, distinct: seen.size, total, message: `Subarray ${left}..${right} has ${seen.size} distinct value${seen.size === 1 ? '' : 's'}; running total ${total}.` })
    }
  }
  frames.push({ pythonLine: P('return total'), phase: 'done', activeLine: L('return total'), at: -1, left: -1, distinct: 0, total, message: `Sum of squared distinct counts: ${total}.` })
  return { input: { nums }, result: total, frames }
}

export const code = `sum of squared distinct counts over all subarrays, modulo 1000000007
  set total to 0
  for each left end from 0 to n minus 1
    create an empty set seen
    for each right end from left to n minus 1
      add nums at right to seen
      add the square of the size of seen to total, modulo 1000000007
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def sum_of_distinct_squares(nums):
    MOD = 1000000007
    total = 0
    n = len(nums)
    for left in range(n):
        seen = set()
        for right in range(left, n):
            seen.add(nums[right])
            total = (total + len(seen) ** 2) % MOD
    return total
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
