export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys nums and k.')
  const { nums, k } = obj
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('nums is an array of 1 to 20 entries.')
  if (nums.some(v => v !== 0 && v !== 1)) throw new Error('nums entries are 0 or 1.')
  const ones = nums.filter(v => v === 1).length
  if (!Number.isInteger(k) || k < 1 || k > ones) throw new Error('k is an integer from 1 to the number of ones in nums.')
  return { nums, k }
}

export function buildTrace(input) {
  const { nums, k } = input
  const positions = []
  nums.forEach((v, i) => { if (v === 1) positions.push(i) })
  // q[j] = position of the j-th one minus j, so a block of consecutive ones is a run of equal q values.
  const q = positions.map((p, j) => p - j)
  const frames = [{ phase: 'start', pythonLine: 2, activeLine: L('const positions = []'), index: -1, marked: [], best: null, message: `The ones sit at positions ${positions.join(', ')}.` }]
  let best = Infinity
  for (let left = 0; left + k <= positions.length; left++) {
    const median = q[left + (k >> 1)]
    let cost = 0
    for (let j = left; j < left + k; j++) cost += Math.abs(q[j] - median)
    if (cost < best) best = cost
    frames.push({ phase: 'window', pythonLine: 8, activeLine: L('for (let left = 0'), index: positions[left], marked: positions.slice(left, left + k), best, message: `Ones ${left + 1} to ${left + k} cost ${cost} swaps to gather around their median. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', pythonLine: 9, activeLine: L('return best'), index: -1, marked: [], best, message: `Minimum swaps: ${best}.` })
  return { input, result: best, frames }
}

export const code = `function minSwapsForKConsecutiveOnes(nums, k) {
  const positions = []
  nums.forEach((v, i) => { if (v === 1) positions.push(i) })
  const q = positions.map((p, j) => p - j)
  let best = Infinity
  for (let left = 0; left + k <= positions.length; left++) {
    const median = q[left + (k >> 1)]
    let cost = 0
    for (let j = left; j < left + k; j++) cost += Math.abs(q[j] - median)
    best = Math.min(best, cost)
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_swaps_for_k_consecutive_ones(nums, k):
    positions = [i for i, v in enumerate(nums) if v == 1]
    q = [p - j for j, p in enumerate(positions)]
    best = float('inf')
    for left in range(len(positions) - k + 1):
        median = q[left + (k >> 1)]
        cost = sum(abs(q[j] - median) for j in range(left, left + k))
        best = min(best, cost)
    return best
`
