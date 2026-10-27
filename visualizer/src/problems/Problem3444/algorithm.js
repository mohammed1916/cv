export function parseInput(text) {
  const o = JSON.parse(text)
  if (!o || !Array.isArray(o.nums) || !Array.isArray(o.target)) throw new Error('Use an object with arrays nums and target.')
  const { nums, target } = o
  if (nums.length < 1 || nums.length > 5) throw new Error('nums must have 1 to 5 entries.')
  if (target.length < 1 || target.length > 4) throw new Error('target must have 1 to 4 entries.')
  if ([...nums, ...target].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Values are integers from 1 to 20.')
  return { nums, target }
}

const lcmOf = (values) => values.reduce((acc, v) => {
  let a = acc
  let b = v
  while (b) [a, b] = [b, a % b]
  return (acc / a) * v
}, 1)

export function buildTrace({ nums, target }) {
  const m = target.length
  const full = (1 << m) - 1
  const subsetLcm = mask => lcmOf(target.filter((_, j) => mask & (1 << j)))
  let dp = new Array(1 << m).fill(Infinity)
  dp[0] = 0
  const frames = [{ phase: 'start', activeLine: L('set cost[0] to zero'), element: -1, dp: dp.slice(), total: Infinity, message: `Cover the ${m} target(s) using the ${nums.length} number(s).` }]
  nums.forEach((x, index) => {
    const next = dp.slice()
    for (let mask = 0; mask <= full; mask++) {
      if (dp[mask] === Infinity) continue
      const rest = full & ~mask
      for (let sub = rest; sub > 0; sub = (sub - 1) & rest) {
        const cost = Math.ceil(x / subsetLcm(sub)) * subsetLcm(sub) - x
        const m2 = mask | sub
        if (dp[mask] + cost < next[m2]) next[m2] = dp[mask] + cost
      }
    }
    dp = next
    frames.push({ phase: 'element', activeLine: L('for each number x'), element: index, dp: dp.slice(), total: dp[full], message: `Number ${x} can cover any subset of targets; cheapest cost to cover all so far: ${dp[full]}.` })
  })
  const result = dp[full]
  frames.push({ phase: 'done', activeLine: L('return cost[full set'), element: nums.length - 1, dp: dp.slice(), total: result, message: `Minimum increments: ${result}.` })
  return { input: { nums, target }, result, frames }
}

export const code = `minimum increments so that every target has a multiple among the numbers
  let cost[mask] be the least increments that cover exactly the targets in mask, using numbers so far
  set cost[0] to zero and every other entry to unreachable
  for each number x in nums
    copy cost into next
    for each mask with a reachable cost
      for each non-empty subset sub of the targets not in mask
        let L be the lcm of the targets in sub
        set cost of the number x to the next multiple of L at or above x, minus x
        set next[mask or sub] to the smaller of itself and cost[mask] plus that cost
    set cost to next
  return cost[full set of targets]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import gcd


def min_increments(nums, target):
    m = len(target)
    full = (1 << m) - 1
    INF = float('inf')
    dp = [INF] * (1 << m)
    dp[0] = 0
    for x in nums:
        nxt = dp[:]
        for mask in range(full + 1):
            if dp[mask] == INF:
                continue
            rest = full & ~mask
            sub = rest
            while sub:
                lcm = 1
                for j in range(m):
                    if sub >> j & 1:
                        lcm = lcm * target[j] // gcd(lcm, target[j])
                cost = -(-x // lcm) * lcm - x
                if dp[mask] + cost < nxt[mask | sub]:
                    nxt[mask | sub] = dp[mask] + cost
                sub = (sub - 1) & rest
        dp = nxt
    return dp[full]
`
