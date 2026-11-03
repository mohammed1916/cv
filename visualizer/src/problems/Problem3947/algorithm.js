// Reading used here: buying a copy of type s may grant one free copy of a different type t when factor[t] is a
// multiple of factor[s]. Each ordered pair (s, t) grants at most once, so type s can grant to at most d[s] types,
// and c purchased copies of s grant min(c, d[s]) free copies. A grant needs a purchased copy, and free copies grant nothing.
export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with budget and types.')
  const { budget, types } = input
  if (!Number.isInteger(budget) || budget < 0 || budget > 30) throw new Error('budget is an integer from 0 to 30.')
  if (!Array.isArray(types) || types.length < 1 || types.length > 6) throw new Error('types lists 1 to 6 [price, factor] pairs.')
  for (const t of types) {
    if (!Array.isArray(t) || t.length !== 2 || !Number.isInteger(t[0]) || t[0] < 1 || t[0] > 9 || !Number.isInteger(t[1]) || t[1] < 1 || t[1] > 12) {
      throw new Error('Each type is [price 1 to 9, factor 1 to 12].')
    }
  }
  return { budget, types }
}

export function grantCounts(types) {
  return types.map(([, factor], s) => types.filter(([, f], t) => t !== s && f % factor === 0).length)
}

// Knapsack over the budget. For each type, the first d copies are worth two (the copy and its grant) and any further
// copies are worth one. The first kind is 0/1 items, the second is unbounded.
export function buildTrace({ budget, types }) {
  const frames = []
  const dp = Array(budget + 1).fill(0)
  const d = grantCounts(types)
  const snap = extra => ({ dp: dp.slice(), ...extra })
  frames.push(snap({ pythonLine: PY('dp = [0]'), phase: 'start', activeLine: L('dp = zeros for each budget'), type: -1, grants: null, value: null, message: `Budget ${budget}; no copies bought yet.` }))
  types.forEach(([price, factor], s) => {
    frames.push(snap({ pythonLine: PY('for s, (price, factor)'), phase: 'type', activeLine: L('for each type s with price'), type: s, grants: d[s], price, value: null, message: `Type ${s}: price ${price}, factor ${factor}; ${d[s]} other type${d[s] === 1 ? '' : 's'} can receive a grant.` }))
    for (let g = 0; g < d[s]; g += 1) {
      for (let b = budget; b >= price; b -= 1) dp[b] = Math.max(dp[b], dp[b - price] + 2)
    }
    frames.push(snap({ pythonLine: PY('for _ in range(d)'), phase: 'granted', activeLine: L('repeat d times'), type: s, grants: d[s], price, value: 2, message: `Granted copies of type ${s} are worth two each.` }))
    for (let b = price; b <= budget; b += 1) dp[b] = Math.max(dp[b], dp[b - price] + 1)
    frames.push(snap({ pythonLine: PY('for b in range(price, budget + 1)'), phase: 'plain', activeLine: L('for each budget from low to high'), type: s, grants: d[s], price, value: 1, message: `Extra copies of type ${s} are worth one each; best with budget ${budget} is ${dp[budget]}.` }))
  })
  const answer = dp[budget]
  frames.push(snap({ pythonLine: PY('return dp[budget]'), phase: 'done', activeLine: L('if the best value is needed'), type: -1, grants: null, value: null, message: `Maximum purchased plus free copies: ${answer}.` }))
  return { input: { budget, types }, result: answer, frames }
}

export const code = `maximum purchased plus free copies within the budget
  dp = zeros for each budget from 0 to budget
  for each type s with price p and factor f
    d = number of other types whose factor is a multiple of f
    repeat d times: a copy worth two, used at most once each
      for each budget from high to low, improve dp using the copy
    for each budget from low to high: a copy worth one, may repeat
      improve dp using the copy
  if the best value is needed, return dp[budget]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def max_items(budget, types):
    dp = [0] * (budget + 1)
    for s, (price, factor) in enumerate(types):
        d = sum(1 for t, (_, f) in enumerate(types) if t != s and f % factor == 0)
        for _ in range(d):
            for b in range(budget, price - 1, -1):
                dp[b] = max(dp[b], dp[b - price] + 2)
        for b in range(price, budget + 1):
            dp[b] = max(dp[b], dp[b - price] + 1)
    return dp[budget]
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
