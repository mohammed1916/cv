const INF = Number.POSITIVE_INFINITY

const CODE = [
  'minimum cost to buy one apple from every start city',
  'build an undirected adjacency list with road costs',
  'answer is an empty list',
  'for each start city s',
  '  set dist to infinity for every city and dist of s to 0',
  '  mark every city unsettled',
  '  repeat once per city',
  '    pick the unsettled city u with the smallest dist',
  '    mark u as settled',
  '    for each road from u to v with cost w',
  '      if dist of u plus w is less than dist of v, update dist of v',
  '  best is infinity',
  '  for each city j',
  '    candidate is apple price at j plus (k + 1) times dist of j',
  '    if candidate is less than best, best is candidate',
  '  append best to answer',
  'return answer',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))

const PY = [
  'def min_cost_to_buy_apples(n, roads, apple_cost, k):',
  '    adj = [[] for _ in range(n)]',
  '    for a, b, w in roads:',
  '        adj[a].append((b, w))',
  '        adj[b].append((a, w))',
  '    answer = []',
  '    for start in range(n):',
  "        dist = [float('inf')] * n",
  '        dist[start] = 0',
  '        done = [False] * n',
  '        for _ in range(n):',
  '            u = -1',
  '            for v in range(n):',
  '                if not done[v] and (u == -1 or dist[v] < dist[u]):',
  '                    u = v',
  '            done[u] = True',
  '            for v, w in adj[u]:',
  '                if dist[u] + w < dist[v]:',
  '                    dist[v] = dist[u] + w',
  "        best = float('inf')",
  '        for j in range(n):',
  '            best = min(best, apple_cost[j] + (k + 1) * dist[j])',
  '        answer.append(best)',
  '    return answer',
]
export const python = `${PY.join('\n')}\n`

const L = key => {
  const found = code.findIndex(c => c.text.includes(key))
  if (found < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return found + 1
}
const P = key => {
  const found = PY.findIndex(line => line.includes(key))
  if (found < 0) throw new Error(`Missing python line: ${key}`)
  return found + 1
}
const snap = values => values.map(v => (v === INF ? null : v))
const fmt = v => (v === INF ? 'infinity' : String(v))

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, roads, apple_cost and k.')
  const { n, roads, apple_cost, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 7) throw new Error('n is an integer from 1 to 7 for the visualization.')
  if (!Array.isArray(apple_cost) || apple_cost.length !== n || apple_cost.some(p => !Number.isInteger(p) || p < 1 || p > 99)) {
    throw new Error('apple_cost has one whole price from 1 to 99 per city.')
  }
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('k is an integer from 1 to 9.')
  if (!Array.isArray(roads) || roads.length > 12) throw new Error('roads is a list of at most 12 triples.')
  for (const road of roads) {
    if (!Array.isArray(road) || road.length !== 3) throw new Error('Each road is [a, b, cost].')
    const [a, b, w] = road
    if (![a, b].every(c => Number.isInteger(c) && c >= 0 && c < n) || a === b) throw new Error('Road endpoints must be different cities from 0 to n-1.')
    if (!Number.isInteger(w) || w < 1 || w > 20) throw new Error('Road costs are whole numbers from 1 to 20.')
  }
  return { n, roads, apple_cost, k }
}

export function buildTrace({ n, roads, apple_cost, k }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, w] of roads) {
    adj[a].push([b, w])
    adj[b].push([a, w])
  }
  const frames = []
  const answer = []
  const F = (phase, codeKey, pyKey, message, state) => frames.push({
    phase, activeLine: L(codeKey), pythonLine: P(pyKey), message, answer: answer.slice(), ...state,
  })
  F('build', 'build an undirected', 'adj = [[]', `Each of the ${roads.length} roads is listed in both directions.`, { start: -1, dist: [], settled: [], u: -1, edge: null, cityCost: [], best: null, j: -1 })
  for (let s = 0; s < n; s++) {
    const dist = Array(n).fill(INF)
    const settled = Array(n).fill(false)
    dist[s] = 0
    F('start', 'for each start city', 'for start in range(n)', `Start from city ${s}; its own distance is 0.`, { start: s, dist: snap(dist), settled: settled.slice(), u: -1, edge: null, cityCost: [], best: null, j: -1 })
    for (let round = 0; round < n; round++) {
      let u = -1
      for (let v = 0; v < n; v++) if (!settled[v] && (u === -1 || dist[v] < dist[u])) u = v
      F('pick', 'pick the unsettled city', 'if not done[v]', `Pick city ${u}, the unsettled city with the smallest distance ${fmt(dist[u])}.`, { start: s, dist: snap(dist), settled: settled.slice(), u, edge: null, cityCost: [], best: null, j: -1 })
      settled[u] = true
      F('settle', 'mark u as settled', 'done[u] = True', `City ${u} is settled: its distance ${fmt(dist[u])} will not change.`, { start: s, dist: snap(dist), settled: settled.slice(), u, edge: null, cityCost: [], best: null, j: -1 })
      for (const [v, w] of adj[u]) {
        const improved = dist[u] + w < dist[v]
        if (improved) dist[v] = dist[u] + w
        const edge = { from: u, to: v, w, improved }
        F('relax', 'if dist of u plus w', 'if dist[u] + w < dist[v]', improved
          ? `Road ${u} to ${v} costs ${w}; city ${v} improves to ${dist[v]}.`
          : `Road ${u} to ${v} costs ${w}; city ${v} keeps ${fmt(dist[v])}.`, { start: s, dist: snap(dist), settled: settled.slice(), u, edge, cityCost: [], best: null, j: -1 })
      }
    }
    let best = INF
    const cityCost = []
    for (let j = 0; j < n; j++) {
      const cost = apple_cost[j] + (k + 1) * dist[j]
      cityCost.push(cost === INF ? null : cost)
      F('candidate', 'candidate is apple price', 'best = min(best', `Buy in city ${j}: apple ${apple_cost[j]} plus going out and back costs ${fmt(cost)}.`, { start: s, dist: snap(dist), settled: settled.slice(), u: -1, edge: null, cityCost: cityCost.slice(), best: fmt(best), j })
      if (cost < best) {
        best = cost
        F('candidate', 'if candidate is less', 'best = min(best', `City ${j} becomes the best purchase so far, at ${best}.`, { start: s, dist: snap(dist), settled: settled.slice(), u: -1, edge: null, cityCost: cityCost.slice(), best: fmt(best), j })
      }
    }
    answer.push(best)
    F('append', 'append best to answer', 'answer.append(best)', `Start ${s} needs ${best} in total.`, { start: s, dist: snap(dist), settled: settled.slice(), u: -1, edge: null, cityCost: cityCost.slice(), best: fmt(best), j: -1 })
  }
  F('done', 'return answer', 'return answer', `Answers for every start city: [${answer.join(', ')}].`, { start: -1, dist: [], settled: [], u: -1, edge: null, cityCost: [], best: null, j: -1 })
  return { input: { n, roads, apple_cost, k }, result: answer, frames }
}
