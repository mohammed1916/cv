export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('Use an array of 1 to 10 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < 0 || v > 99)) throw new Error('Values are integers from 0 to 99.')
  return nums
}

export function buildTrace(nums) {
  const evens = []
  const odds = []
  nums.forEach((v, i) => (v % 2 === 0 ? evens : odds).push(i))
  const e = evens.length
  const o = odds.length
  const frames = [{ phase: 'count', activeLine: L('list the positions'), costs: [], result: null, message: `${e} even and ${o} odd values.` }]
  if (Math.abs(e - o) > 1) {
    frames.push({ phase: 'done', activeLine: L('return -1'), costs: [], result: -1, message: 'The counts differ by more than one, so no alternating arrangement exists: return -1.' })
    return { input: nums, result: -1, frames }
  }
  const costs = []
  if (e >= o) {
    const cost = evens.reduce((s, p, k) => s + Math.abs(p - 2 * k), 0)
    costs.push({ start: 'even', cost })
    frames.push({ phase: 'even', activeLine: L('cost of even-first'), costs: [...costs], result: null, message: `Even-first pattern: evens move to positions 0, 2, 4 and so on, at total cost ${cost}.` })
  }
  if (o >= e) {
    const cost = odds.reduce((s, p, k) => s + Math.abs(p - 2 * k), 0)
    costs.push({ start: 'odd', cost })
    frames.push({ phase: 'odd', activeLine: L('cost of odd-first'), costs: [...costs], result: null, message: `Odd-first pattern: odds move to positions 0, 2, 4 and so on, at total cost ${cost}.` })
  }
  const result = Math.min(...costs.map(c => c.cost))
  frames.push({ phase: 'done', activeLine: L('return the smaller cost'), costs: [...costs], result, message: `Minimum adjacent swaps: ${result}.` })
  return { input: nums, result, frames }
}

export const code = `minimum adjacent swaps for alternating parity:
  list the positions of the even values and of the odd values
  if the counts differ by more than one then return -1
  if there are at least as many evens as odds, cost of even-first is the sum of |position minus 2k| over evens
  if there are at least as many odds as evens, cost of odd-first is the sum of |position minus 2k| over odds
  return the smaller cost`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_adjacent_swaps(nums):
    evens = [i for i, v in enumerate(nums) if v % 2 == 0]
    odds = [i for i, v in enumerate(nums) if v % 2 == 1]
    e, o = len(evens), len(odds)
    if abs(e - o) > 1:
        return -1
    costs = []
    if e >= o:
        costs.append(sum(abs(p - 2 * k) for k, p in enumerate(evens)))
    if o >= e:
        costs.append(sum(abs(p - 2 * k) for k, p in enumerate(odds)))
    return min(costs)
`
