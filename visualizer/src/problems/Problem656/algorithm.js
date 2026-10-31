const INF = Infinity

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (!Array.isArray(spec.coins) || spec.coins.length < 1 || spec.coins.length > 30) throw new Error('Use 1 to 30 coins.')
  if (spec.coins.some(c => !Number.isInteger(c) || c < -1 || c > 100)) throw new Error('Coins are integers from -1 (blocked) to 100.')
  if (!Number.isInteger(spec.maxJump) || spec.maxJump < 1 || spec.maxJump > 30) throw new Error('maxJump is an integer from 1 to 30.')
  return spec
}

export function buildTrace(spec) {
  const { coins, maxJump } = spec
  const n = coins.length
  // cost[i]: cheapest total coins from index i to the last index; INF when blocked or unreachable.
  const cost = Array(n).fill(INF)
  const frames = [{ phase: 'start', pythonLine: P('for i in range(n - 1'), activeLine: L('for i from n - 1'), index: null, cost: [...cost], path: [], message: `Work backwards from the last index. A blocked coin (-1) can never be visited.` }]
  for (let i = n - 1; i >= 0; i--) {
    if (coins[i] === -1) {
      frames.push({ phase: 'fill', pythonLine: P('if coins[i] == -1'), activeLine: L('if coins[i] is blocked'), index: i, cost: [...cost], path: [], message: `Index ${i + 1} is blocked: it has no cost.` })
      continue
    }
    if (i === n - 1) cost[i] = coins[i]
    else cost[i] = coins[i] + Math.min(...cost.slice(i + 1, Math.min(n, i + maxJump + 1)))
    frames.push({ phase: 'fill', pythonLine: i === n - 1 ? P('if i == n - 1') : P('cost[i] = coins[i] + min'), activeLine: i === n - 1 ? L('if i is the last index') : L('otherwise set cost[i]'), index: i, cost: [...cost], path: [], message: cost[i] === INF ? `No way to finish from index ${i + 1}.` : `Cheapest total from index ${i + 1} is ${cost[i]}: its coin plus the best reachable continuation.` })
  }
  const path = []
  if (cost[0] !== INF) {
    let i = 0
    path.push(0)
    while (i < n - 1) {
      // The earliest reachable index with the best continuation cost gives the lexicographically smallest optimal path.
      let next = i + 1
      while (cost[next] !== cost[i] - coins[i]) next++
      i = next
      path.push(i)
      frames.push({ phase: 'walk', pythonLine: P('i = next(j for'), activeLine: L('set i to the first j'), index: i, cost: [...cost], path: [...path], message: `Step to index ${i + 1}: the earliest index that keeps the cheapest total ${cost[i]}.` })
    }
  }
  const result = path.map(i => i + 1)
  frames.push({ phase: 'done', pythonLine: result.length ? P('return [j + 1') : P('if cost[0] == INF'), activeLine: result.length ? L('return path with') : L('if cost[0] is infinity'), index: null, cost: [...cost], path: [...path], message: result.length ? `Cheapest path with the smallest indices: ${result.join(' → ')}.` : 'No path reaches the last index.' })
  return { input: spec, coins, result, frames }
}

export const code = `function cheapestJump(coins, maxJump):
  set n to the number of coins
  set cost to n copies of infinity
  for i from n - 1 down to 0:
    if coins[i] is blocked (-1), continue to the next i
    if i is the last index, set cost[i] to coins[i]
    otherwise set cost[i] to coins[i] plus the smallest cost among indices i+1 to i+maxJump
  if cost[0] is infinity, return an empty path
  set path to [0] and i to 0
  while i is less than the last index:
    set i to the first j from i+1 to i+maxJump where cost[j] equals cost[i] - coins[i]
    append i to path
  return path with every index plus 1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export const python = `def cheapest_jump(coins, maxJump):
    n = len(coins)
    INF = float('inf')
    cost = [INF] * n
    for i in range(n - 1, -1, -1):
        if coins[i] == -1:
            continue
        if i == n - 1:
            cost[i] = coins[i]
        else:
            cost[i] = coins[i] + min(cost[i + 1:min(n, i + maxJump + 1)])
    if cost[0] == INF:
        return []
    path, i = [0], 0
    while i < n - 1:
        i = next(j for j in range(i + 1, min(n, i + maxJump + 1)) if cost[j] == cost[i] - coins[i])
        path.append(i)
    return [j + 1 for j in path]
`
