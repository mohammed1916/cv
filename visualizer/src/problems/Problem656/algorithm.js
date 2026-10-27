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
  const frames = [{ phase: 'start', activeLine: L('cost = [INF]'), index: null, cost: [...cost], path: [], message: `Work backwards from the last index. A blocked coin (-1) can never be visited.` }]
  for (let i = n - 1; i >= 0; i--) {
    if (coins[i] === -1) {
      frames.push({ phase: 'fill', activeLine: L('if coins[i] == -1'), index: i, cost: [...cost], path: [], message: `Index ${i + 1} is blocked: it has no cost.` })
      continue
    }
    if (i === n - 1) cost[i] = coins[i]
    else cost[i] = coins[i] + Math.min(...cost.slice(i + 1, Math.min(n, i + maxJump + 1)))
    frames.push({ phase: 'fill', activeLine: L('cost[i] = coins[i] + min'), index: i, cost: [...cost], path: [], message: cost[i] === INF ? `No way to finish from index ${i + 1}.` : `Cheapest total from index ${i + 1} is ${cost[i]}: its coin plus the best reachable continuation.` })
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
      frames.push({ phase: 'walk', activeLine: L('next(j for j'), index: i, cost: [...cost], path: [...path], message: `Step to index ${i + 1}: the earliest index that keeps the cheapest total ${cost[i]}.` })
    }
  }
  const result = path.map(i => i + 1)
  frames.push({ phase: 'done', activeLine: L('return [j + 1'), index: null, cost: [...cost], path: [...path], message: result.length ? `Cheapest path with the smallest indices: ${result.join(' → ')}.` : 'No path reaches the last index.' })
  return { input: spec, coins, result, frames }
}

export const code = `def cheapestJump(coins, maxJump):
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
    return [j + 1 for j in path]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
