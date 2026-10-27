const MAX_SIDE = 4

export function parseInput(text) {
  const data = JSON.parse(text)
  const cost = data?.cost
  if (!Array.isArray(cost) || cost.length < 1 || cost.length > MAX_SIDE) throw new Error(`cost must have 1 to ${MAX_SIDE} rows.`)
  const width = Array.isArray(cost[0]) ? cost[0].length : 0
  if (width < 1 || width > MAX_SIDE) throw new Error(`Each row must have 1 to ${MAX_SIDE} entries.`)
  for (const row of cost) {
    if (!Array.isArray(row) || row.length !== width) throw new Error('Every row must have the same length.')
    if (row.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error('Costs are integers from 0 to 100.')
  }
  return { cost }
}

export const code = `minimum cost to connect(cost)
  let m be the rows (first group) and n the columns (second group)
  set dp[0][0] to 0 and every other dp[0][mask] to infinity
  for each point i in the first group
    for each mask of covered second-group points
      for each point j in the second group
        keep the smallest dp[i][mask] + cost[i][j] in dp[i+1][mask with j]
  for each mask: add the cheapest edge into each uncovered second-group point
  return the smallest total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Each first-group point takes one edge. The mask records which second-group points have an edge so far.
// Second-group points still uncovered each take their cheapest edge from the first group.
export function buildTrace({ cost }) {
  const m = cost.length
  const n = cost[0].length
  const size = 1 << n
  const INF = Infinity
  let dp = Array(size).fill(INF)
  dp[0] = 0
  const show = table => table.map(row => row.map(v => (v === INF ? '∞' : v)))
  const table = [dp.slice()]
  const frames = [{ phase: 'start', row: 0, table: show(table), activeLine: L('set dp[0][0]'), message: 'Nothing is connected yet.' }]
  for (let i = 0; i < m; i++) {
    const next = Array(size).fill(INF)
    for (let mask = 0; mask < size; mask++) {
      if (dp[mask] === INF) continue
      for (let j = 0; j < n; j++) {
        const target = mask | (1 << j)
        const candidate = dp[mask] + cost[i][j]
        if (candidate < next[target]) next[target] = candidate
      }
    }
    dp = next
    table.push(dp.slice())
    frames.push({ phase: 'row', row: i + 1, table: show(table), activeLine: L('for each point i in the first group'), message: `First-group point ${i + 1} has taken an edge; the table shows the cheapest totals for each covered set.` })
  }
  let result = INF
  for (let mask = 0; mask < size; mask++) {
    if (dp[mask] === INF) continue
    let total = dp[mask]
    for (let j = 0; j < n; j++) {
      if (mask & (1 << j)) continue
      total += Math.min(...cost.map(row => row[j]))
    }
    result = Math.min(result, total)
  }
  frames.push({ phase: 'done', row: m, table: show(table), activeLine: L('return the smallest total'), result, message: `Cheapest way to connect both groups: ${result}.` })
  return { input: { cost }, result, frames }
}

export const python = `def connect_two_groups(cost):
    m = len(cost)
    n = len(cost[0])
    INF = float('inf')
    dp = [INF] * (1 << n)
    dp[0] = 0
    for i in range(m):
        nxt = [INF] * (1 << n)
        for mask in range(1 << n):
            if dp[mask] == INF:
                continue
            for j in range(n):
                target = mask | (1 << j)
                nxt[target] = min(nxt[target], dp[mask] + cost[i][j])
        dp = nxt
    result = INF
    for mask in range(1 << n):
        if dp[mask] == INF:
            continue
        total = dp[mask]
        for j in range(n):
            if not (mask >> j) & 1:
                total += min(cost[i][j] for i in range(m))
        result = min(result, total)
    return result
`
