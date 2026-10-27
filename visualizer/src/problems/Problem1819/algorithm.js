const MAX_LENGTH = 8
const MAX_VALUE = 30

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.nums)) throw new Error('Use an object like {"nums":[6,10,3]}.')
  if (data.nums.length < 1 || data.nums.length > MAX_LENGTH) throw new Error(`Use 1 to ${MAX_LENGTH} values.`)
  if (data.nums.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  return { nums: data.nums }
}

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))

export function buildTrace({ nums }) {
  const present = new Set(nums)
  const largest = Math.max(...nums)
  const achieved = []
  let count = 0
  const frames = [{ phase: 'start', activeLine: L('set max_value to the largest'), g: 0, running: 0, achieved: [], count: 0, message: `Candidates run from 1 to ${largest}.` }]
  for (let g = 1; g <= largest; g++) {
    let running = 0
    for (let m = g; m <= largest; m += g) if (present.has(m)) running = gcd(running, m)
    if (running === g) { count++; achieved.push(g) }
    frames.push({ phase: 'check', activeLine: L('if running equals g'), g, running, achieved: [...achieved], count, message: running === g ? `${g} is a subsequence gcd. Count: ${count}.` : `${g} is not a subsequence gcd (multiples give ${running}).` })
  }
  frames.push({ phase: 'done', activeLine: L('return count'), g: largest, running: 0, achieved: [...achieved], count, message: `${count} different gcd values.` })
  return { input: { nums }, result: count, frames }
}

export const code = `count the different gcds of non-empty subsequences
  set max_value to the largest number in nums
  set count to 0
  for each candidate g from 1 to max_value
    set running to 0
    for each multiple m of g up to max_value
      if m is in nums then set running to gcd(running, m)
    if running equals g then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_different_gcds(nums):
    from math import gcd
    present = set(nums)
    largest = max(nums)
    count = 0
    for g in range(1, largest + 1):
        running = 0
        for m in range(g, largest + 1, g):
            if m in present:
                running = gcd(running, m)
        if running == g:
            count += 1
    return count
`
