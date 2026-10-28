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
  const frames = [{ phase: 'start', activeLine: L('set positions'), index: -1, marked: [], best: null, message: `The ones sit at positions ${positions.join(', ')}.` }]
  let best = Infinity
  for (let left = 0; left + k <= positions.length; left++) {
    const median = q[left + (k >> 1)]
    let cost = 0
    for (let j = left; j < left + k; j++) cost += Math.abs(q[j] - median)
    if (cost < best) best = cost
    frames.push({ phase: 'window', activeLine: L('for each window'), index: positions[left], marked: positions.slice(left, left + k), best, message: `Ones ${left + 1} to ${left + k} cost ${cost} swaps to gather around their median. Best so far: ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, marked: [], best, message: `Minimum swaps: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum adjacent swaps for k consecutive ones
  set positions to the indexes of every 1 in nums
  set q to each position minus its rank among the ones
  set best to infinity
  for each window of k consecutive entries in q
    set median to the middle entry of the window
    set cost to the sum of distances from each entry to median
    if cost is below best then
      set best to cost
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_adjacent_swaps(nums, k):
    positions = [i for i, v in enumerate(nums) if v == 1]
    q = [p - j for j, p in enumerate(positions)]
    best = float('inf')
    for left in range(len(q) - k + 1):
        median = q[left + k // 2]
        cost = sum(abs(q[j] - median) for j in range(left, left + k))
        if cost < best:
            best = cost
    return best
`
