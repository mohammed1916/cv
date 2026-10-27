export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with source, target, original, changed and cost.')
  const { source, target, original, changed, cost } = input
  if (typeof source !== 'string' || typeof target !== 'string' || source.length < 1 || source.length > 8 || source.length !== target.length || !/^[a-c]+$/.test(source + target)) throw new Error('source and target are equal-length strings of 1 to 8 letters a to c.')
  if (!Array.isArray(original) || !Array.isArray(changed) || !Array.isArray(cost) || original.length !== changed.length || original.length !== cost.length || original.length > 6) throw new Error('original, changed and cost are equal-length arrays of at most 6 entries.')
  original.forEach((o, i) => {
    if (typeof o !== 'string' || typeof changed[i] !== 'string' || o.length < 1 || o.length > 3 || o.length !== changed[i].length || !/^[a-c]+$/.test(o + changed[i])) throw new Error('Each rule pairs two equal-length strings of 1 to 3 letters a to c.')
    if (!Number.isInteger(cost[i]) || cost[i] < 1 || cost[i] > 20) throw new Error('Each cost is an integer from 1 to 20.')
  })
  return { source, target, original, changed, cost }
}

export function buildTrace({ source, target, original, changed, cost }) {
  const names = []
  const id = new Map()
  const addName = s => { if (!id.has(s)) { id.set(s, names.length); names.push(s) } }
  original.forEach((o, i) => { addName(o); addName(changed[i]) })
  const n = names.length
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  const frames = [{ phase: 'start', activeLine: L('collect every distinct'), names, matrix: dist.map(r => [...r]), dp: [], message: `Collect ${n} distinct strings from the rules as graph nodes.` }]
  original.forEach((o, i) => {
    const a = id.get(o)
    const b = id.get(changed[i])
    dist[a][b] = Math.min(dist[a][b], cost[i])
  })
  frames.push({ phase: 'set', activeLine: L('set dist'), names, matrix: dist.map(r => [...r]), dp: [], message: 'Each rule gives the cheapest direct cost between its two strings.' })
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j]
      }
    }
    frames.push({ phase: 'floyd', activeLine: L('run Floyd'), names, matrix: dist.map(r => [...r]), dp: [], message: `Allow ${names[k]} as a stepping stone between rule strings.` })
  }
  // cost of turning one piece of source into the matching piece of target
  const pieceCost = (a, b) => {
    if (a === b) return 0
    if (id.has(a) && id.has(b)) return dist[id.get(a)][id.get(b)]
    return Infinity
  }
  const N = source.length
  const dp = new Array(N + 1).fill(Infinity)
  dp[0] = 0
  frames.push({ phase: 'dp', activeLine: L('set dp'), names, matrix: dist.map(r => [...r]), dp: [...dp], message: 'dp[0] is 0. Every other prefix starts unreachable.' })
  for (let i = 1; i <= N; i++) {
    for (let j = 0; j < i; j++) {
      const c = pieceCost(source.slice(j, i), target.slice(j, i))
      if (dp[j] + c < dp[i]) dp[i] = dp[j] + c
    }
    frames.push({ phase: 'dp', activeLine: L('for each start j'), names, matrix: dist.map(r => [...r]), dp: [...dp], message: `Cheapest way to convert the first ${i} characters: ${dp[i] === Infinity ? 'unreachable' : dp[i]}.` })
  }
  const result = dp[N] === Infinity ? -1 : dp[N]
  frames.push({ phase: 'done', activeLine: L('return -1'), names, matrix: dist.map(r => [...r]), dp: [...dp], message: result === -1 ? 'The whole string cannot be converted.' : `Minimum cost: ${result}.` })
  return { input: { source, target, original, changed, cost }, result, frames }
}

export const code = `find the cheapest way to turn source into target by converting pieces of equal length
collect every distinct string in original and changed as a node
set dist[a][b] to 0 when a equals b, and to the cheapest rule cost otherwise
run Floyd-Warshall over the nodes: for each k, each i and each j, relax dist[i][j] through k
set dp[0] to 0 and every other dp entry to infinity
for each end i from 1 to n do
  for each start j before i do
    relax dp[i] with dp[j] plus the cost of turning source[j..i) into target[j..i)
return -1 if dp[n] is infinite, otherwise dp[n]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def minimum_cost(source, target, original, changed, cost):
    INF = float('inf')
    ids = {}
    for s in list(original) + list(changed):
        if s not in ids:
            ids[s] = len(ids)
    n = len(ids)
    dist = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    for o, c, w in zip(original, changed, cost):
        a, b = ids[o], ids[c]
        dist[a][b] = min(dist[a][b], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    def piece_cost(a, b):
        if a == b:
            return 0
        if a in ids and b in ids:
            return dist[ids[a]][ids[b]]
        return INF

    N = len(source)
    dp = [INF] * (N + 1)
    dp[0] = 0
    for i in range(1, N + 1):
        for j in range(i):
            c = piece_cost(source[j:i], target[j:i])
            if dp[j] + c < dp[i]:
                dp[i] = dp[j] + c
    return -1 if dp[N] == INF else dp[N]
`
