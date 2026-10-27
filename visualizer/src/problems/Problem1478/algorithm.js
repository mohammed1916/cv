const MAX_HOUSES = 8
const MAX_POSITION = 100

export function parseInput(text) {
  const data = JSON.parse(text)
  const { houses, k } = data ?? {}
  if (!Array.isArray(houses) || houses.length < 1 || houses.length > MAX_HOUSES) throw new Error(`houses must list 1 to ${MAX_HOUSES} positions.`)
  if (houses.some(h => !Number.isInteger(h) || h < 1 || h > MAX_POSITION)) throw new Error(`House positions are integers from 1 to ${MAX_POSITION}.`)
  if (new Set(houses).size !== houses.length) throw new Error('House positions must be distinct.')
  if (!Number.isInteger(k) || k < 1 || k > houses.length) throw new Error('k must be an integer from 1 to the number of houses.')
  return { houses, k }
}

export const code = `minimum total distance(houses, k)
  sort houses
  for each range of houses from i to j
    set cost[i][j] to the total distance from the range to its median house
  set best[0][0] to 0 and best[0][i] to infinity for i above 0
  for each number of mailboxes m from 1 to k
    for each prefix length i from m to n
      for each split p where m-1 mailboxes cover the first p houses
        keep the smallest best[m-1][p] + cost[p][i-1] in best[m][i]
  return best[k][n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// Houses on a line: one mailbox serving houses i..j sits at their median, so cost[i][j] is the distance to it.
export function buildTrace({ houses, k }) {
  const h = [...houses].sort((a, b) => a - b)
  const n = h.length
  const INF = Infinity
  const cost = Array.from({ length: n }, () => Array(n).fill(0))
  const frames = [{ phase: 'start', range: null, median: null, cell: null, table: null, activeLine: L('sort houses'), message: 'Sort the houses so that every mailbox serves a run of neighbours.' }]
  const show = v => (v === INF ? '∞' : v)
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const median = h[(i + j) >> 1]
      let total = 0
      for (let t = i; t <= j; t++) total += Math.abs(h[t] - median)
      cost[i][j] = total
      frames.push({ phase: 'cost', range: [i, j], median: (i + j) >> 1, cell: null, table: null, activeLine: L('set cost[i][j]'), message: `Houses ${h[i]} to ${h[j]} share a mailbox at ${median}, a total distance of ${total}.` })
    }
  }
  const best = Array.from({ length: k + 1 }, () => Array(n + 1).fill(INF))
  best[0][0] = 0
  const snapshot = () => best.map(row => row.map(show))
  frames.push({ phase: 'base', range: null, median: null, cell: null, table: snapshot(), activeLine: L('set best[0][0]'), message: 'Zero mailboxes can cover zero houses at no cost.' })
  for (let m = 1; m <= k; m++) {
    for (let i = m; i <= n; i++) {
      for (let p = m - 1; p < i; p++) {
        if (best[m - 1][p] === INF) continue
        const candidate = best[m - 1][p] + cost[p][i - 1]
        if (candidate < best[m][i]) best[m][i] = candidate
      }
      frames.push({ phase: 'cell', range: null, median: null, cell: [m, i], table: snapshot(), activeLine: L('keep the smallest'), message: `${m} mailbox(es) cover the first ${i} houses at a best cost of ${show(best[m][i])}.` })
    }
  }
  const result = best[k][n]
  frames.push({ phase: 'done', range: null, median: null, cell: [k, n], table: snapshot(), activeLine: L('return best[k][n]'), result, message: `Minimum total distance with ${k} mailboxes: ${result}.` })
  return { input: { houses, k }, sorted: h, result, frames }
}

export const python = `def min_total_distance(houses, k):
    h = sorted(houses)
    n = len(h)
    cost = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i, n):
            median = h[(i + j) // 2]
            cost[i][j] = sum(abs(h[t] - median) for t in range(i, j + 1))
    INF = float('inf')
    best = [[INF] * (n + 1) for _ in range(k + 1)]
    best[0][0] = 0
    for m in range(1, k + 1):
        for i in range(m, n + 1):
            for p in range(m - 1, i):
                if best[m - 1][p] < INF:
                    candidate = best[m - 1][p] + cost[p][i - 1]
                    if candidate < best[m][i]:
                        best[m][i] = candidate
    return best[k][n]
`
