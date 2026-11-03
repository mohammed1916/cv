export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 8) throw new Error('nums is a list of 2 to 8 entries.')
  for (const v of nums) {
    if (!(v === -1 || (Number.isInteger(v) && v >= 1 && v <= 20))) throw new Error('Each entry is -1 (missing) or an integer from 1 to 20.')
  }
  return { nums }
}

// Best assignment for a fixed pair (x, y): each -1 takes x or y, and we minimise the largest adjacent gap.
export function costForPair(nums, x, y) {
  const options = nums.map(v => (v === -1 ? [x, y] : [v]))
  let prev = options[0].map(value => ({ cost: 0, from: -1, value }))
  const back = [prev]
  for (let i = 1; i < nums.length; i++) {
    const row = options[i].map(value => {
      let best = { cost: Infinity, from: -1 }
      prev.forEach((p, j) => {
        const cost = Math.max(p.cost, Math.abs(p.value - value))
        if (cost < best.cost) best = { cost, from: j }
      })
      return { ...best, value }
    })
    back.push(row)
    prev = row
  }
  let k = 0
  prev.forEach((p, j) => { if (p.cost < prev[k].cost) k = j })
  const cost = prev[k].cost
  const assignment = Array(nums.length)
  let idx = k
  for (let i = nums.length - 1; i >= 0; i--) {
    assignment[i] = back[i][idx].value
    idx = back[i][idx].from
  }
  return { cost, assignment }
}

export function buildTrace({ nums }) {
  const known = nums.filter(v => v !== -1)
  const lo = known.length ? Math.min(...known) : 1
  const hi = known.length ? Math.max(...known) : 1
  const frames = []
  const frame = (phase, line, message, extra = {}) => frames.push({ phase, activeLine: line, pythonLine: 1, message, nums, x: null, y: null, assignment: null, cost: null, best: null, ...extra })
  frame('scan', 1, `Known values lie in ${lo} to ${hi}. Any pair (x, y) can be clamped into that range without making the result worse.`)
  let best = null
  for (let x = lo; x <= hi; x++) {
    for (let y = x; y <= hi; y++) {
      const { cost, assignment } = costForPair(nums, x, y)
      if (best === null || cost < best.cost) {
        best = { cost, x, y, assignment }
        frame('best', 1, `Pair (${x}, ${y}) gives a largest gap of ${cost}, the best so far.`, { x, y, assignment, cost, best: { ...best } })
      } else {
        frame('pair', 1, `Pair (${x}, ${y}) gives a largest gap of ${cost}; it does not beat ${best.cost}.`, { x, y, assignment, cost, best: { ...best } })
      }
    }
  }
  frame('done', 1, `Result: ${best.cost}, using (${best.x}, ${best.y}).`, { x: best.x, y: best.y, assignment: best.assignment, cost: best.cost, best: { ...best } })
  return { input: { nums }, result: best.cost, frames }
}

export const code = `collect the known values and their smallest and largest
for each pair x at most y inside that range
  run a small dynamic program over the positions, where each -1 takes x or y
  record the lowest largest gap the program can reach
keep the pair with the lowest largest gap
return that gap`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def min_max_adjacent_difference(nums):
    known = [v for v in nums if v != -1]
    lo, hi = (min(known), max(known)) if known else (1, 1)
    best = None
    for x in range(lo, hi + 1):
        for y in range(x, hi + 1):
            cost = cheapest_assignment(nums, x, y)
            best = cost if best is None else min(best, cost)
    return best`
