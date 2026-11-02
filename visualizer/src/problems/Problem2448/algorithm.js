export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and cost.')
  const { nums, cost } = input
  if (!Array.isArray(nums) || !Array.isArray(cost) || nums.length < 1 || nums.length > 12 || nums.length !== cost.length) throw new Error('nums and cost have the same length, 1 to 12.')
  if (!nums.every(x => Number.isInteger(x) && x >= 1 && x <= 50)) throw new Error('Each nums value is an integer from 1 to 50.')
  if (!cost.every(c => Number.isInteger(c) && c >= 1 && c <= 100)) throw new Error('Each cost is an integer from 1 to 100.')
  return { nums, cost }
}

export function buildTrace({ nums, cost }) {
  const frames = []
  const pairs = nums.map((x, i) => ({ x, c: cost[i] })).sort((a, b) => a.x - b.x || a.c - b.c)
  const total = cost.reduce((s, c) => s + c, 0)
  const sorted = pairs.map(p => `${p.x}/${p.c}`)
  frames.push({ pythonLine: 2, phase: 'sort', activeLine: L('sort by value'), at: -1, sorted, running: 0, total, target: null, result: null, message: `Sort ${nums.length} pairs by value; total cost weight ${total}.` })
  let running = 0
  let target = pairs[0].x
  for (let i = 0; i < pairs.length; i++) {
    running += pairs[i].c
    frames.push({ pythonLine: 6, phase: 'accumulate', activeLine: L('running +='), at: i, sorted, running, total, target: null, result: null, message: `Weight up to value ${pairs[i].x} is ${running} of ${total}.` })
    if (2 * running >= total) {
      target = pairs[i].x
      frames.push({ pythonLine: 8, phase: 'median', activeLine: L('target = value'), at: i, sorted, running, total, target, result: null, message: `Half the weight is reached at value ${target}; use it as the target.` })
      break
    }
  }
  const result = pairs.reduce((s, p) => s + p.c * Math.abs(p.x - target), 0)
  frames.push({ pythonLine: 10, phase: 'done', activeLine: L('return sum'), at: -1, sorted, running, total, target, result, message: `Cost to move every value to ${target} is ${result}.` })
  return { input: { nums, cost }, result, frames }
}

export const code = `minimum cost to make all values equal
  sort the pairs (value, cost) by value
  total = sum of all costs
  running = 0
  for each pair in sorted order
    running += cost
    if 2 times running is at least total then target = value and stop
  return the sum of cost times the distance from value to target`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_to_make_equal(nums, cost):
    pairs = sorted(zip(nums, cost))
    total = sum(cost)
    running = 0
    for value, c in pairs:
        running += c
        if 2 * running >= total:
            target = value
            break
    return sum(c * abs(x - target) for x, c in pairs)
`
