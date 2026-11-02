const CODE_LINES = [
  'for each vertex v, cost[0][v] is 1 if names[v] differs from target[0], else 0',
  'for each position k from 1 to the last',
  'for each vertex v',
  'best is the smallest cost[k-1][u] over neighbours u of v, remembering u',
  'cost[k][v] = best plus 1 if names[v] differs from target[k], else plus 0',
  'choose the vertex v with the smallest cost at the last position',
  'follow the remembered neighbours back to position 0',
  'return the path',
]

export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const index = CODE_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`pseudocode line missing: ${text}`)
  return index + 1
}

export const python = `def most_similar(n, roads, names, target):
    adj = [[] for _ in range(n)]
    for a, b in roads:
        adj[a].append(b)
        adj[b].append(a)
    INF = float("inf")
    cost = [[INF] * n for _ in range(len(target))]
    parent = [[-1] * n for _ in range(len(target))]
    for v in range(n):
        cost[0][v] = 0 if names[v] == target[0] else 1
    for k in range(1, len(target)):
        for v in range(n):
            best = INF
            for u in adj[v]:
                if cost[k - 1][u] < best:
                    best = cost[k - 1][u]
                    parent[k][v] = u
            if best < INF:
                cost[k][v] = best + (0 if names[v] == target[k] else 1)
    last = min(range(n), key=lambda v: cost[-1][v])
    if cost[-1][last] == INF:
        return []
    path = [last]
    for k in range(len(target) - 1, 0, -1):
        path.append(parent[k][path[-1]])
    path.reverse()
    return path
`
const PY_LINES = python.split('\n')
const P = text => {
  const index = PY_LINES.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`python line missing: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'base', label: 'Position 0', description: 'Mark each vertex by whether its name matches the first target name.' },
  { id: 'cell', label: 'Extend', description: 'Extend the best walk into this vertex from a neighbour.' },
  { id: 'pick', label: 'Pick end', description: 'Choose the cheapest vertex at the last position.' },
  { id: 'trace', label: 'Trace back', description: 'Follow the remembered neighbours to position 0.' },
  { id: 'done', label: 'Result', description: 'Return the vertex path.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, roads, names and targetPath.')
  const { n, roads, names, targetPath } = input
  if (!Number.isInteger(n) || n < 1 || n > 6) throw new Error('n is an integer from 1 to 6 (visualization cap).')
  if (!Array.isArray(roads) || roads.length > 15) throw new Error('roads has at most 15 [a, b] pairs (visualization cap).')
  for (const pair of roads) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(x => Number.isInteger(x) && x >= 0 && x < n && x !== undefined) || pair[0] === pair[1]) {
      throw new Error('Each road is [a, b] with distinct vertices from 0 to n-1.')
    }
  }
  if (!Array.isArray(names) || names.length !== n || !names.every(s => typeof s === 'string' && s.length >= 1 && s.length <= 4)) throw new Error('names has one string of 1 to 4 characters per vertex (visualization cap).')
  if (!Array.isArray(targetPath) || targetPath.length < 1 || targetPath.length > 6 || !targetPath.every(s => typeof s === 'string' && s.length >= 1 && s.length <= 4)) throw new Error('targetPath has 1 to 6 strings of 1 to 4 characters (visualization cap).')
  return { n, roads, names, targetPath }
}

export function buildTrace({ n, roads, names, targetPath }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of roads) { adj[a].push(b); adj[b].push(a) }
  const L_ = targetPath.length
  const INF = Infinity
  const cost = Array.from({ length: L_ }, () => Array(n).fill(INF))
  const parent = Array.from({ length: L_ }, () => Array(n).fill(-1))
  const frames = []
  const frame = (phase, activeLine, pythonLine, k, v, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, k, v, message, cost: cost.map(row => [...row]), parent: parent.map(row => [...row]), names, targetPath, ...extra,
  })
  for (let v = 0; v < n; v++) {
    cost[0][v] = names[v] === targetPath[0] ? 0 : 1
    frame('base', L('for each vertex v, cost[0][v]'), P('cost[0][v] = 0 if'), 0, v, `${names[v]} ${names[v] === targetPath[0] ? 'matches' : 'differs from'} ${targetPath[0]}: cost ${cost[0][v]}.`)
  }
  for (let k = 1; k < L_; k++) {
    for (let v = 0; v < n; v++) {
      let best = INF
      for (const u of adj[v]) {
        if (cost[k - 1][u] < best) { best = cost[k - 1][u]; parent[k][v] = u }
      }
      if (best < INF) cost[k][v] = best + (names[v] === targetPath[k] ? 0 : 1)
      frame('cell', L('cost[k][v] = best plus 1'), P('cost[k][v] = best +'), k, v,
        best < INF ? `Vertex ${v} at position ${k}: best neighbour ${parent[k][v]} costs ${best}; total ${cost[k][v]}.` : `Vertex ${v} has no neighbour, so no walk reaches it here.`)
    }
  }
  const last = cost[L_ - 1].indexOf(Math.min(...cost[L_ - 1]))
  frame('pick', L('choose the vertex v with the smallest cost'), P('last = min('), L_ - 1, last, `Cheapest end is vertex ${last} with ${cost[L_ - 1][last]} mismatch${cost[L_ - 1][last] === 1 ? '' : 'es'}.`)
  let result = []
  const route = Array(L_).fill(-1)
  if (cost[L_ - 1][last] < INF) {
    route[L_ - 1] = last
    for (let k = L_ - 1; k > 0; k--) {
      const prev = parent[k][route[k]]
      route[k - 1] = prev
      frame('trace', L('follow the remembered neighbours'), P('path.append(parent[k]'), k - 1, prev, `Position ${k - 1} is vertex ${prev}.`, { route: [...route] })
    }
    result = [...route]
  }
  frame('done', L('return the path'), P('return path'), -1, -1, result.length ? `Path ${result.join(' → ')} with ${cost[L_ - 1][last]} mismatches.` : 'No walk of this length exists.', { route: [...route] })
  return { input: { n, roads, names, targetPath }, result, frames, mismatches: result.length ? cost[L_ - 1][last] : null }
}
