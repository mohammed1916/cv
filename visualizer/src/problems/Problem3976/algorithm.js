export const code = `best is negative infinity
for each index, record the best subarray sum ending there and starting there
if there are at least two values, a proper subarray that leaves out one end is a candidate
for each operation, multiply by k or divide by k with truncation toward zero
  build the modified values g
  prefix sums of g give the sum of any interval after the operation
  for each right end r, try every left end l at or before r
    the modified interval is l to r, and the scoring subarray extends it on both sides
    candidate is g summed over l to r, plus the best left extension, plus the best right extension
    best is the larger of best and candidate
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def max_subarray_after_multiplier(nums, k):
    n = len(nums)
    end = [0] * n
    start = [0] * n
    for i in range(n):
        end[i] = nums[i] + max(0, end[i - 1]) if i > 0 else nums[i]
    for i in range(n - 1, -1, -1):
        start[i] = nums[i] + max(0, start[i + 1]) if i < n - 1 else nums[i]

    def best_sub(a):
        best = cur = a[0]
        for x in a[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best

    best = None
    if n >= 2:
        best = max(best_sub(nums[:-1]), best_sub(nums[1:]))
    for g in ([x * k for x in nums], [int(x / k) for x in nums]):
        prefix = [0] * (n + 1)
        for i in range(n):
            prefix[i + 1] = prefix[i] + g[i]
        best_start = None
        for r in range(n):
            left = max(0, end[r - 1]) if r > 0 else 0
            cand_start = left - prefix[r]
            if best_start is None or cand_start > best_start:
                best_start = cand_start
            right = max(0, start[r + 1]) if r < n - 1 else 0
            value = prefix[r + 1] + best_start + right
            if best is None or value > best:
                best = value
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and k.')
  const { nums, k } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 8) throw new Error('nums holds 1 to 8 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= -20 && v <= 20)) throw new Error('Each value is an integer from -20 to 20.')
  if (!Number.isInteger(k) || k < 1 || k > 20) throw new Error('k is an integer from 1 to 20.')
  return { nums, k }
}

const bestSub = a => {
  let best = a[0]
  let cur = a[0]
  for (let i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i])
    best = Math.max(best, cur)
  }
  return best
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const frames = []
  const end = Array(n).fill(0)
  const start = Array(n).fill(0)
  for (let i = 0; i < n; i++) end[i] = i > 0 ? nums[i] + Math.max(0, end[i - 1]) : nums[i]
  for (let i = n - 1; i >= 0; i--) start[i] = i < n - 1 ? nums[i] + Math.max(0, start[i + 1]) : nums[i]
  let best = null
  let bestPlan = null
  const base = { nums, k, end: [...end], start: [...start] }
  frames.push({ ...base, phase: 'start', activeLine: L('best is negative infinity'), pythonLine: P('best = None'), op: null, g: null, r: -1, leftIdx: -1, leftExt: 0, rightExt: 0, candidate: null, best, bestPlan, message: `Choose one interval to multiply or divide by ${k}, then take the best subarray.` })
  frames.push({ ...base, phase: 'ends', activeLine: L('record the best subarray sum ending there'), pythonLine: P('end[i] = nums[i]'), op: null, g: null, r: -1, leftIdx: -1, leftExt: 0, rightExt: 0, candidate: null, best, bestPlan, message: 'Record the best subarray ending and starting at each index of the original array.' })
  if (n >= 2) {
    const proper = Math.max(bestSub(nums.slice(0, n - 1)), bestSub(nums.slice(1)))
    best = proper
    bestPlan = { op: 'none', l: -1, r: -1, value: proper, note: 'Leave the modified interval outside the scored subarray.' }
    frames.push({ ...base, phase: 'proper', activeLine: L('a proper subarray'), pythonLine: P('best = max(best_sub'), op: null, g: null, r: -1, leftIdx: -1, leftExt: 0, rightExt: 0, candidate: proper, best, bestPlan, message: `A proper subarray that avoids one end scores ${proper}; the modified interval can sit outside it.` })
  }
  const ops = [
    { name: 'multiply', g: nums.map(x => x * k) },
    { name: 'divide', g: nums.map(x => Math.trunc(x / k)) },
  ]
  for (const op of ops) {
    frames.push({ ...base, phase: 'op', activeLine: L('for each operation'), pythonLine: P('for g in'), op: op.name, g: op.g, r: -1, leftIdx: -1, leftExt: 0, rightExt: 0, candidate: null, best, bestPlan, message: `${op.name === 'multiply' ? `Multiply` : 'Divide'} the chosen interval; its values become [${op.g.join(', ')}] if taken whole.` })
    const prefix = [0]
    for (const v of op.g) prefix.push(prefix[prefix.length - 1] + v)
    let bestStart = null
    let leftIdx = -1
    for (let r = 0; r < n; r++) {
      const leftExt = r > 0 ? Math.max(0, end[r - 1]) : 0
      const candStart = leftExt - prefix[r]
      if (bestStart === null || candStart > bestStart) { bestStart = candStart; leftIdx = r }
      const rightExt = r < n - 1 ? Math.max(0, start[r + 1]) : 0
      const value = prefix[r + 1] + bestStart + rightExt
      const pickedL = leftIdx
      const bestLeftExt = pickedL > 0 ? Math.max(0, end[pickedL - 1]) : 0
      if (best === null || value > best) {
        best = value
        bestPlan = { op: op.name, l: pickedL, r, value, note: '' }
      }
      frames.push({ ...base, phase: 'sweep', activeLine: L('candidate is g summed over l to r'), pythonLine: P('value = prefix[r + 1]'), op: op.name, g: op.g, r, leftIdx: pickedL, leftExt: bestLeftExt, rightExt, candidate: value, best, bestPlan, message: `Modified interval ${pickedL} to ${r} with left extension ${bestLeftExt} and right extension ${rightExt} gives ${value}.` })
    }
  }
  frames.push({ ...base, phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), op: null, g: null, r: -1, leftIdx: -1, leftExt: 0, rightExt: 0, candidate: null, best, bestPlan, message: `Best achievable sum is ${best}.` })
  return { input: { nums, k }, result: best, frames }
}
