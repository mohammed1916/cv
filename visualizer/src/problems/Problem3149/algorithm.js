const MAX_LENGTH = 8

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums.')
  const { nums } = input
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > MAX_LENGTH) throw new Error(`nums has 2 to ${MAX_LENGTH} entries.`)
  const sorted = [...nums].sort((a, b) => a - b)
  if (!sorted.every((v, i) => v === i)) throw new Error(`nums must contain each of 0 to ${nums.length - 1} exactly once.`)
  return { nums: [...nums] }
}

// Score of a closed cycle: sum over i of |perm[i] - nums[perm[i + 1]]|, wrapping at the end.
export function cycleScore(nums, perm) {
  let total = 0
  for (let i = 0; i < perm.length; i++) total += Math.abs(perm[i] - nums[perm[(i + 1) % perm.length]])
  return total
}

export function buildTrace({ nums }) {
  const n = nums.length
  const full = (1 << n) - 1
  const memo = new Map()

  // Cheapest cost to finish the cycle from a partial path, given the visited mask and last value.
  function rest(mask, last) {
    if (mask === full) return Math.abs(last - nums[0])
    const key = mask * n + last
    if (memo.has(key)) return memo.get(key)
    let best = Infinity
    for (let next = 1; next < n; next++) {
      if (mask & (1 << next)) continue
      best = Math.min(best, Math.abs(last - nums[next]) + rest(mask | (1 << next), next))
    }
    memo.set(key, best)
    return best
  }

  const frames = []
  const perm = [0]
  let mask = 1
  let last = 0
  let spent = 0
  const total = rest(mask, last)
  frames.push({
    phase: 'start', activeLine: L('set perm to start at 0'), pythonLine: P('perm = [0]'),
    message: `The cycle starts at 0. The cheapest closed cost from here is ${total}.`,
    perm: [...perm], candidates: [], chosen: null, spent, remaining: total, closing: null,
  })

  while (perm.length < n) {
    const candidates = []
    for (let next = 1; next < n; next++) {
      if (mask & (1 << next)) continue
      candidates.push({ value: next, cost: Math.abs(last - nums[next]) + rest(mask | (1 << next), next) })
    }
    let chosen = candidates[0]
    for (const c of candidates) if (c.cost < chosen.cost) chosen = c
    const step = Math.abs(last - nums[chosen.value])
    perm.push(chosen.value)
    mask |= 1 << chosen.value
    last = chosen.value
    spent += step
    frames.push({
      phase: 'choose', activeLine: L('for each unused value'), pythonLine: P('for nxt in range(1, n):'),
      message: `Take ${chosen.value}: the step costs ${step} and the cheapest completion still totals ${chosen.cost}. Smallest value wins ties.`,
      perm: [...perm], candidates, chosen: chosen.value, spent, remaining: chosen.cost - step, closing: null,
    })
  }

  const closing = Math.abs(last - nums[0])
  spent += closing
  frames.push({
    phase: 'close', activeLine: L('return the cycle'), pythonLine: P('return perm'),
    message: `Close the cycle back to 0 with cost |${last} - nums[0]| = ${closing}. Total ${spent}.`,
    perm: [...perm], candidates: [], chosen: null, spent, remaining: 0, closing,
  })
  if (spent !== total) throw new Error('Greedy reconstruction disagrees with the table')
  frames.push({
    phase: 'done', activeLine: L('return the cycle'), pythonLine: P('return perm'),
    message: `Permutation [${perm.join(', ')}] has score ${spent}.`,
    perm: [...perm], candidates: [], chosen: null, spent, remaining: 0, closing: null,
  })
  return { input: { nums: [...nums] }, result: perm, score: spent, frames }
}

function lineIndex(lines, text, label) {
  const index = lines.findIndex(line => line.trim() === text || line.includes(text))
  if (index < 0) throw new Error(`Missing ${label} line: ${text}`)
  return index + 1
}
const L = text => lineIndex(code.map(c => c.text), text, 'pseudocode')
const P = text => lineIndex(python.split('\n'), text, 'python')

export const code = `minimum cost array permutation
rest(mask, last) is the cheapest cost to finish the cycle from here
set perm to start at 0 with mask holding only 0
while perm is shorter than n
  for each unused value nxt
    candidate cost is |last - nums[nxt]| plus rest(mask with nxt, nxt)
  choose the smallest value with the least candidate cost
  append it to perm and update mask and last
return the cycle`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))

export const python = `def min_cost_array_permutation(nums):
    n = len(nums)
    full = (1 << n) - 1
    memo = {}

    def rest(mask, last):
        if mask == full:
            return abs(last - nums[0])
        key = (mask, last)
        if key in memo:
            return memo[key]
        best = None
        for nxt in range(1, n):
            if mask >> nxt & 1:
                continue
            cost = abs(last - nums[nxt]) + rest(mask | (1 << nxt), nxt)
            if best is None or cost < best:
                best = cost
        memo[key] = best
        return best

    perm = [0]
    mask = 1
    last = 0
    while len(perm) < n:
        best_next = None
        best_cost = None
        for nxt in range(1, n):
            if mask >> nxt & 1:
                continue
            cost = abs(last - nums[nxt]) + rest(mask | (1 << nxt), nxt)
            if best_cost is None or cost < best_cost:
                best_cost = cost
                best_next = nxt
        perm.append(best_next)
        mask |= 1 << best_next
        last = best_next
    return perm
`
