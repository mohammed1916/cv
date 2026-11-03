export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || !nums.every(x => Number.isInteger(x) && x >= 1 && x <= 9)) throw new Error('nums has 1 to 12 integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('k is an integer from 1 to 9.')
  return { nums, k }
}

// Adding x to nums[i..j] turns every v in that range into k when x = k - v.
// The final count is (copies of k outside the range) + (copies of v inside) which is cntK + (#v - #k) inside.
export function buildTrace({ nums, k }) {
  const frames = []
  const cntK = nums.filter(v => v === k).length
  let best = 0
  let bestValue = null
  let bestWindow = null
  frames.push({ pythonLine: P('count_k ='), phase: 'start', activeLine: L('count the copies of k'), at: -1, end: -1, gain: 0, value: null, count: cntK, message: `${cntK} copies of k already exist; the best gain starts at 0.` })
  const values = [...new Set(nums)].filter(v => v !== k).sort((a, b) => a - b)
  for (const v of values) {
    let current = 0
    let start = 0
    let localBest = -Infinity
    let window = null
    for (let i = 0; i < nums.length; i++) {
      const delta = nums[i] === v ? 1 : nums[i] === k ? -1 : 0
      if (current <= 0) { current = delta; start = i } else current += delta
      if (current > localBest) { localBest = current; window = [start, i] }
    }
    frames.push({ pythonLine: P('for v in'), phase: 'try', activeLine: L('for each other value'), at: window ? window[0] : -1, end: window ? window[1] : -1, gain: localBest, value: v, count: cntK + Math.max(0, localBest), message: `Shift the value ${v} to ${k}: best gain ${localBest}.` })
    if (localBest > best) { best = localBest; bestValue = v; bestWindow = window }
  }
  const result = cntK + Math.max(0, best)
  frames.push({ pythonLine: P('return count_k'), phase: 'done', activeLine: L('return the best frequency'), at: bestWindow ? bestWindow[0] : -1, end: bestWindow ? bestWindow[1] : -1, gain: Math.max(0, best), value: bestValue, count: result, result, message: `Maximum frequency of ${k} is ${result}.` })
  return { input: { nums, k }, result, frames }
}

export const code = `maximum frequency of k after adding x to one subarray
  count the copies of k
  for each value v different from k
    find the subarray with the largest (copies of v) minus (copies of k)
  return copies of k plus the best gain (at least 0)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_frequency(nums, k):
    count_k = nums.count(k)
    best = 0
    for v in set(nums) - {k}:
        current = 0
        for x in nums:
            delta = 1 if x == v else -1 if x == k else 0
            current = max(delta, current + delta)
            best = max(best, current)
    return count_k + best`
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1
