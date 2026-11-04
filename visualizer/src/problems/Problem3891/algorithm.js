const codeLines = `function minIncrease(nums) {
  const n = nums.length
  // candidates are the interior indices 1 to n minus 2
  // cost[i] = max(0, max(nums[i-1], nums[i+1]) + 1 - nums[i]) is the raise that makes i a peak
  const cost = Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) cost[i] = Math.max(0, Math.max(nums[i - 1], nums[i + 1]) + 1 - nums[i])
  // best[k] = better of best[k-1] and best[k-2] plus candidate k
  // better means more special indices, then lower total cost
  const best = [{ count: 0, cost: 0 }]
  const at = k => (k < 0 ? { count: 0, cost: 0 } : best[k])
  for (let k = 1; k <= n - 2; k++) {
    const take = { count: at(k - 2).count + 1, cost: at(k - 2).cost + cost[k] }
    const keep = at(k - 1)
    best[k] = take.count > keep.count || (take.count === keep.count && take.cost < keep.cost) ? take : keep
  }
  // return the cost part of best for the last candidate
  return n >= 3 ? best[n - 2].cost : 0
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def min_increase(nums):
    n = len(nums)
    cost = [0] * n
    for i in range(1, n - 1):
        cost[i] = max(0, max(nums[i - 1], nums[i + 1]) + 1 - nums[i])
    best = [(0, 0)] * (n + 1)
    for k in range(1, n - 1):
        take_prev = best[k - 2] if k >= 2 else (0, 0)
        take = (take_prev[0] + 1, take_prev[1] + cost[k])
        keep = best[k - 1]
        best[k] = take if (take[0], -take[1]) > (keep[0], -keep[1]) else keep
    return best[n - 2][1] if n >= 3 else 0`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.nums)) throw new Error('Use an object with nums, a list of integers.')
  const nums = input.nums
  if (nums.length < 1 || nums.length > 12) throw new Error('nums has 1 to 12 values in this visual.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 20)) throw new Error('Values are integers from 0 to 20.')
  return { nums }
}

export function costOf(nums, i) {
  return Math.max(0, Math.max(nums[i - 1], nums[i + 1]) + 1 - nums[i])
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  const cost = Array(n).fill(0)
  for (let i = 1; i < n - 1; i++) cost[i] = costOf(nums, i)
  frames.push({ phase: 'cost', activeLine: L('cost[i] = max'), pythonLine: P('cost[i] = max'), k: -1, cost: [...cost], best: null, pickedTake: null,
    message: n < 3 ? 'Fewer than three values: no interior index exists.' : 'Each interior index needs a raise to beat its larger neighbour.' })
  const best = [{ count: 0, cost: 0, chosen: [] }]
  const at = k => (k < 0 ? { count: 0, cost: 0, chosen: [] } : best[k])
  for (let k = 1; k <= n - 2; k++) {
    const index = k
    const prev = at(k - 2)
    const take = { count: prev.count + 1, cost: prev.cost + cost[index], chosen: [...prev.chosen, index] }
    const keep = at(k - 1)
    const pick = take.count > keep.count || (take.count === keep.count && take.cost < keep.cost) ? take : keep
    best[k] = pick
    frames.push({ phase: 'dp', activeLine: L('best[k] = better'), pythonLine: P('best[k] = take'), k: index, cost: [...cost], best: pick, pickedTake: pick === take,
      message: `Position ${index}: ${pick === take ? 'taking it' : 'skipping it'} gives ${pick.count} special, cost ${pick.cost}.` })
  }
  const final = n >= 3 ? best[n - 2] : { count: 0, cost: 0, chosen: [] }
  frames.push({ phase: 'done', activeLine: L('return the cost part'), pythonLine: P('return best'), k: -1, cost: [...cost], best: final, pickedTake: null,
    message: `Maximum ${final.count} special index${final.count === 1 ? '' : 'es'} with cost ${final.cost}.` })
  return { input: { nums }, result: final.cost, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
