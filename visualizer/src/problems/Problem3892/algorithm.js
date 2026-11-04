const codeLines = `function minOps(nums, k) {
  const n = nums.length
  // if k is larger than n divided by 2 then return -1
  if (k > Math.floor(n / 2)) return -1
  // best = infinity
  let best = Infinity
  // for each set S of k positions with no two circularly adjacent
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) chosen.push(i)
    if (chosen.length !== k) continue
    // skip a set when a chosen index is followed circularly by another chosen index
    if (chosen.some(i => (mask >> ((i + 1) % n)) & 1)) continue
    // cost = sum over i in S of max(0, max(prev, next) + 1 - nums[i])
    const cost = chosen.reduce((sum, i) => sum + Math.max(0, Math.max(nums[(i - 1 + n) % n], nums[(i + 1) % n]) + 1 - nums[i]), 0)
    best = Math.min(best, cost)
  }
  // return best
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def min_ops(nums, k):
    n = len(nums)
    if k == 0:
        return 0
    if k > n // 2:
        return -1
    best = None
    for mask in range(1 << n):
        chosen = [i for i in range(n) if mask >> i & 1]
        if len(chosen) != k or any(mask >> i & 1 and mask >> ((i + 1) % n) & 1 for i in range(n)):
            continue
        cost = sum(max(0, max(nums[i - 1], nums[(i + 1) % n]) + 1 - nums[i]) for i in chosen)
        best = cost if best is None else min(best, cost)
    return best`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums) || !Number.isInteger(input.k)) throw new Error('Use an object with nums (circular) and an integer k.')
  const { nums, k } = input
  if (nums.length < 3 || nums.length > 10) throw new Error('nums has 3 to 10 values in this visual.')
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20.')
  if (k < 0 || k > nums.length) throw new Error('k is between 0 and the length of nums.')
  return { nums, k }
}

export function peakCost(nums, i) {
  const n = nums.length
  return Math.max(0, Math.max(nums[(i - 1 + n) % n], nums[(i + 1) % n]) + 1 - nums[i])
}

export function buildTrace({ nums, k }) {
  const n = nums.length
  const frames = []
  if (k === 0) {
    frames.push({ phase: 'done', activeLine: L('if k is larger'), pythonLine: P('return 0'), set: [], cost: 0, best: 0, k,
      message: 'No peaks are required, so no operation is needed.' })
    return { input: { nums, k }, result: 0, frames }
  }
  if (k > Math.floor(n / 2)) {
    frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), set: [], cost: null, best: -1, k,
      message: `At most ${Math.floor(n / 2)} peaks fit on a circle of ${n}, so the answer is -1.` })
    return { input: { nums, k }, result: -1, frames }
  }
  let best = null
  let bestSet = []
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) chosen.push(i)
    if (chosen.length !== k) continue
    if (chosen.some(i => (mask >> i) & 1 && (mask >> ((i + 1) % n)) & 1)) continue
    const cost = chosen.reduce((sum, i) => sum + peakCost(nums, i), 0)
    if (best === null || cost < best) { best = cost; bestSet = chosen }
    frames.push({ phase: 'candidate', activeLine: L('cost = sum over'), pythonLine: P('cost = sum'), set: chosen, cost, best,
      message: `Peaks at {${chosen.join(', ')}} cost ${cost}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), set: bestSet, cost: best, best,
    message: `Cheapest set {${bestSet.join(', ')}} costs ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
