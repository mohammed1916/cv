export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with houses, cost, m, n and target.')
  const { houses, cost, m, n, target } = input
  if (!Number.isInteger(m) || m < 1 || m > 6) throw new Error('m must be an integer from 1 to 6.')
  if (!Number.isInteger(n) || n < 1 || n > 3) throw new Error('n must be an integer from 1 to 3.')
  if (!Number.isInteger(target) || target < 1 || target > m) throw new Error('target must be an integer from 1 to m.')
  if (!Array.isArray(houses) || houses.length !== m || houses.some(v => !Number.isInteger(v) || v < 0 || v > n)) throw new Error('houses must have m entries, each 0 (unpainted) or a colour from 1 to n.')
  if (!Array.isArray(cost) || cost.length !== m || cost.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > 20))) throw new Error('cost must be m rows of n integers from 1 to 20.')
  return { houses, cost, m, n, target }
}

const INF = Infinity
const grid = (rows, cols) => Array.from({ length: rows }, () => Array(cols).fill(INF))
const shown = table => table.map(row => row.slice(1).map(v => (v === INF ? '∞' : v)))

export function buildTrace(input) {
  const { houses, cost, m, n, target } = input
  let dp = grid(target + 1, n + 1)
  for (let c = 1; c <= n; c++) {
    if (houses[0] === 0 || houses[0] === c) dp[1][c] = houses[0] === c ? 0 : cost[0][c - 1]
  }
  const frames = [{ phase: 'start', activeLine: L('set dp[1][c]'), house: 0, color: 0, count: 0, table: shown(dp), total: null, message: 'House 0 opens the first neighbourhood in each colour it may take.' }]
  for (let i = 1; i < m; i++) {
    const next = grid(target + 1, n + 1)
    for (let c = 1; c <= n; c++) {
      if (houses[i] !== 0 && houses[i] !== c) continue
      const paint = houses[i] === c ? 0 : cost[i][c - 1]
      for (let j = 1; j <= target; j++) {
        let best = dp[j][c]
        for (let d = 1; d <= n; d++) if (d !== c) best = Math.min(best, dp[j - 1][d])
        next[j][c] = best + paint
        frames.push({ phase: 'cell', activeLine: L('set next[j][c] to best plus paint'), house: i, color: c, count: j, table: shown(next), total: null, message: `House ${i} in colour ${c} with ${j} neighbourhood(s): ${next[j][c] === INF ? 'not possible' : next[j][c]}.` })
      }
    }
    dp = next
  }
  const best = Math.min(...dp[target].slice(1))
  const result = best === INF ? -1 : best
  frames.push({ phase: 'done', activeLine: L('return the smallest'), house: m - 1, color: 0, count: target, table: shown(dp), total: result, message: result === -1 ? 'No painting gives exactly the target neighbourhoods.' : `Minimum cost: ${result}.` })
  return { input, result, frames }
}

export const code = `minimum cost to paint the houses (houses, cost, m, n, target):
  set every dp[j][c] to nothing
  for each colour c from 1 to n:
    if house 0 is unpainted or already colour c then set dp[1][c] to the cost of house 0 in colour c
  for each house i from 1 to m - 1:
    set next to a table of nothing
    for each colour c from 1 to n:
      if house i is painted another colour then skip this colour
      set paint to 0 if house i is already colour c, otherwise cost[i][c]
      for each neighbourhood count j from 1 to target:
        set best to dp[j][c]
        for each other colour d from 1 to n where d is not c:
          set best to the smaller of best and dp[j - 1][d]
        set next[j][c] to best plus paint
    replace dp with next
  return the smallest dp[target][c] over all colours, or -1 if every one is nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_cost_paint(houses, cost, m, n, target):
    INF = float('inf')
    dp = [[INF] * (n + 1) for _ in range(target + 1)]
    for c in range(1, n + 1):
        if houses[0] == 0 or houses[0] == c:
            dp[1][c] = 0 if houses[0] == c else cost[0][c - 1]
    for i in range(1, m):
        nxt = [[INF] * (n + 1) for _ in range(target + 1)]
        for c in range(1, n + 1):
            if houses[i] != 0 and houses[i] != c:
                continue
            paint = 0 if houses[i] == c else cost[i][c - 1]
            for j in range(1, target + 1):
                best = dp[j][c]
                for d in range(1, n + 1):
                    if d != c:
                        best = min(best, dp[j - 1][d])
                nxt[j][c] = best + paint
        dp = nxt
    result = min(dp[target][1:])
    return -1 if result == INF else result
`
