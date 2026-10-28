export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, k and p.')
  const { nums, k, p } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('nums has 1 to 8 integers from 1 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > nums.length) throw new Error('k is from 1 to the length of nums.')
  if (!Number.isInteger(p) || p < 1 || p > 20) throw new Error('p is an integer from 1 to 20.')
  return input
}

export function buildTrace({ nums, k, p }) {
  const seen = new Set()
  const frames = [{ phase: 'start', activeLine: L('set seen to an empty set'), start: null, end: null, divisible: 0, distinct: 0, message: `Count distinct subarrays with at most ${k} multiples of ${p}.` }]
  for (let i = 0; i < nums.length; i++) {
    let divisible = 0
    for (let j = i; j < nums.length; j++) {
      if (nums[j] % p === 0) divisible++
      if (divisible > k) {
        frames.push({ phase: 'stop', activeLine: L('stop this start'), start: i, end: j, divisible, distinct: seen.size, message: `Subarray ${i}..${j} has ${divisible} multiples of ${p}, so stop extending from ${i}.` })
        break
      }
      const key = JSON.stringify(nums.slice(i, j + 1))
      const repeat = seen.has(key)
      seen.add(key)
      frames.push({ phase: 'add', activeLine: L('add the subarray'), start: i, end: j, divisible, distinct: seen.size, message: `Subarray ${i}..${j} ${repeat ? 'repeats an earlier subarray' : 'is new'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the size of seen'), start: null, end: null, divisible: 0, distinct: seen.size, message: `${seen.size} distinct subarray(s) qualify.` })
  return { input: { nums, k, p }, result: seen.size, frames }
}

export const code = `count distinct subarrays with at most k multiples of p:
  set seen to an empty set
  for each start index i
    set divisible to zero
    for each end index j from i to the last index
      if nums[j] is a multiple of p then add one to divisible
      if divisible is more than k then stop this start
      add the subarray from i to j to seen
  return the size of seen`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_distinct_subarrays(nums, k, p):
    seen = set()
    for i in range(len(nums)):
        divisible = 0
        for j in range(i, len(nums)):
            if nums[j] % p == 0:
                divisible += 1
            if divisible > k:
                break
            seen.add(tuple(nums[i:j + 1]))
    return len(seen)
`
