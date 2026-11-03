export const code = `the largest sum of two values whose indices are at least k apart
  set best to nothing
  set prefix best to nothing and prefix index to negative one
  for j from k to the last index
    let i be j minus k
    if nums at i is larger than prefix best then set prefix best to nums at i and prefix index to i
    candidate is prefix best plus nums at j
    if best is nothing or candidate is larger than best then set best to candidate
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def maximum_valid_pair_sum(nums, k):
    best = None
    prefix_best = None
    prefix_index = -1
    for j in range(k, len(nums)):
        i = j - k
        if prefix_best is None or nums[i] > prefix_best:
            prefix_best = nums[i]
            prefix_index = i
        candidate = prefix_best + nums[j]
        if best is None or candidate > best:
            best = candidate
    return best
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums) || !Number.isInteger(input.k)) {
    throw new Error('Use an object with nums (array) and integer k.')
  }
  const { nums, k } = input
  if (nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 values in this visualization.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 50)) throw new Error('Values are integers from 1 to 50.')
  if (k < 1 || k > nums.length - 1) throw new Error('k must be between 1 and length minus 1.')
  return { nums, k }
}

export function buildTrace({ nums, k }) {
  const frames = []
  let best = null
  let prefixBest = null
  let prefixIndex = -1
  frames.push({ pythonLine: P('best = None'), phase: 'start', activeLine: L('set best to nothing'), j: -1, i: -1, prefixIndex, best, candidate: null, at: -1, message: `Pairs need j - i >= ${k}. The first right end is j = ${k}.` })
  for (let j = k; j < nums.length; j++) {
    const i = j - k
    let replaced = false
    if (prefixBest === null || nums[i] > prefixBest) {
      prefixBest = nums[i]
      prefixIndex = i
      replaced = true
    }
    frames.push({ pythonLine: P('i = j - k'), phase: 'extend', activeLine: L('let i be j minus k'), j, i, prefixIndex, best, candidate: null, at: i, message: `Index ${i} becomes available for j = ${j}.` })
    if (replaced) {
      frames.push({ pythonLine: P('prefix_best = nums[i]'), phase: 'prefix', activeLine: L('if nums at i is larger'), j, i, prefixIndex, best, candidate: null, at: prefixIndex, message: `Prefix best is now ${prefixBest} at index ${prefixIndex}.` })
    }
    const candidate = prefixBest + nums[j]
    const improved = best === null || candidate > best
    if (improved) best = candidate
    frames.push({ pythonLine: P('candidate = prefix_best'), phase: 'candidate', activeLine: L('candidate is prefix best plus'), j, i, prefixIndex, best, candidate, at: j,
      message: `Pair (${prefixIndex}, ${j}) sums to ${candidate}. ${improved ? `New best ${best}.` : `Best stays ${best}.`}` })
  }
  frames.push({ pythonLine: P('return best'), phase: 'done', activeLine: L('return best'), j: -1, i: -1, prefixIndex, best, candidate: null, at: -1, message: `The largest valid pair sum is ${best}.` })
  return { input: { nums, k }, result: best, frames }
}
