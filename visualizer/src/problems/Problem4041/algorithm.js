// Each element can be used once, transformed into any value it reaches by doubling or halving (rounding down).
// The cost of reaching value v from x is the fewest operations, found by breadth-first search.
// A grouped knapsack then finds the cheapest way to hit the target: for each element, a sum s can grow by
// any reachable value v at cost c. dp[s] is the fewest operations giving subset sum s.

const MAX_ELEMENTS = 6
const MAX_VALUE = 20
const MAX_TARGET = 30
const INF = Infinity

const codeLines = [
  'dp[0] is 0 and every other sum is unknown',
  'for each element x in nums',
  '  cost is the fewest operations from x to each value up to target (breadth-first search)',
  '  fresh is a copy of dp',
  '  for each sum s that is reachable in dp',
  '    for each value v reachable from x with cost c, if s plus v is within target',
  '      fresh[s + v] is the smaller of itself and dp[s] plus c',
  '  dp is fresh',
  'return dp[target], or -1 if it is unreachable',
]

export const code = codeLines.map((text, index) => ({ line: index + 1, text }))

const L = fragment => {
  const index = codeLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing pseudocode line: ${fragment}`)
  return index + 1
}

const pythonLines = [
  'from collections import deque',
  'INF = float("inf")',
  'def reach_costs(x, target):',
  '    bound = 2 * max(target, x)',
  '    dist = {x: 0}',
  '    queue = deque([x])',
  '    while queue:',
  '        v = queue.popleft()',
  '        for w in (2 * v, v // 2):',
  '            if 1 <= w <= bound and w not in dist:',
  '                dist[w] = dist[v] + 1',
  '                queue.append(w)',
  '    return {v: c for v, c in dist.items() if 1 <= v <= target}',
  'def min_ops_subset_sum(nums, target):',
  '    dp = [INF] * (target + 1)',
  '    dp[0] = 0',
  '    for x in nums:',
  '        cost = reach_costs(x, target)',
  '        fresh = dp[:]',
  '        for s in range(target + 1):',
  '            if dp[s] == INF:',
  '                continue',
  '            for v, c in cost.items():',
  '                if s + v <= target and dp[s] + c < fresh[s + v]:',
  '                    fresh[s + v] = dp[s] + c',
  '        dp = fresh',
  '    return dp[target] if dp[target] < INF else -1',
]

export const python = pythonLines.join('\n') + '\n'

const P = fragment => {
  const index = pythonLines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Missing python line: ${fragment}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums and target.')
  const { nums, target } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_ELEMENTS) throw new Error(`nums has 1 to ${MAX_ELEMENTS} values.`)
  if (!nums.every(v => Number.isInteger(v) && v >= 1 && v <= MAX_VALUE)) throw new Error(`Each value is an integer from 1 to ${MAX_VALUE}.`)
  if (!Number.isInteger(target) || target < 1 || target > MAX_TARGET) throw new Error(`target is an integer from 1 to ${MAX_TARGET}.`)
  return { nums, target }
}

// Breadth-first search from x: fewest operations to each value in [1, target]. Values may briefly exceed target.
function reachCosts(x, target) {
  const bound = 2 * Math.max(target, x)
  const dist = new Map([[x, 0]])
  const queue = [x]
  for (let head = 0; head < queue.length; head++) {
    const v = queue[head]
    for (const w of [2 * v, Math.floor(v / 2)]) {
      if (w >= 1 && w <= bound && !dist.has(w)) {
        dist.set(w, dist.get(v) + 1)
        queue.push(w)
      }
    }
  }
  return [...dist.entries()].filter(([v]) => v >= 1 && v <= target)
}

export function buildTrace({ nums, target }) {
  const frames = []
  let dp = Array(target + 1).fill(INF)
  dp[0] = 0
  const show = arr => arr.map(v => (v === INF ? null : v))

  frames.push({ phase: 'start', pythonLine: P('dp[0] = 0'), activeLine: L('dp[0] is 0'), element: null, index: -1, reach: [], s: -1, dp: show(dp), message: `dp[0] = 0: the empty subset makes sum 0 for free. Target ${target}.` })

  nums.forEach((x, index) => {
    const reach = reachCosts(x, target)
    frames.push({ phase: 'reach', pythonLine: P('cost = reach_costs'), activeLine: L('cost is the fewest operations'), element: x, index, reach, s: -1, dp: show(dp), message: `Element ${x} can become ${reach.map(([v, c]) => `${v} (${c} op${c === 1 ? '' : 's'})`).join(', ')} within target.` })
    const fresh = dp.slice()
    frames.push({ phase: 'copy', pythonLine: P('fresh = dp[:]'), activeLine: L('fresh is a copy'), element: x, index, reach, s: -1, dp: show(fresh), message: 'Start the new table as a copy: leaving this element out is always allowed.' })
    for (let s = 0; s <= target; s++) {
      if (dp[s] === INF) continue
      for (const [v, c] of reach) {
        if (s + v <= target && dp[s] + c < fresh[s + v]) {
          fresh[s + v] = dp[s] + c
          frames.push({ phase: 'improve', pythonLine: P('fresh[s + v] = dp[s] + c'), activeLine: L('fresh[s + v] is the smaller'), element: x, index, reach, s, v, c, dp: show(fresh), message: `Sum ${s} + ${v} = ${s + v} costs ${dp[s] + c} (${dp[s]} + ${c}).` })
        }
      }
    }
    dp = fresh
    frames.push({ phase: 'commit', pythonLine: P('dp = fresh'), activeLine: L('dp is fresh'), element: x, index, reach, s: -1, dp: show(dp), message: `After element ${x}, the table is updated.` })
  })

  const answer = dp[target] < INF ? dp[target] : -1
  frames.push({ phase: 'done', pythonLine: P('return dp[target]'), activeLine: L('return dp[target]'), element: null, index: -1, reach: [], s: -1, dp: show(dp), message: answer === -1 ? `Sum ${target} cannot be formed.` : `Fewest operations for sum ${target}: ${answer}.` })
  return { input: { nums, target }, result: answer, frames }
}
