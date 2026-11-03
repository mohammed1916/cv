export const code = `start state (node 0, run 1) at distance zero; every other state is infinite
repeat until no unfinished state has a finite distance
  pick the unfinished state (v, run) with the smallest distance and mark it finished
  for each edge v to w with weight c
    next run is run plus one if labels[w] equals labels[v], otherwise one
    if next run is at most k and distance plus c improves state (w, next run), update it
return the smallest distance among states (n minus 1, run), or -1 if none is finite`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq

def shortest_limited_run(labels, k, edges):
    n = len(labels)
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
    INF = float('inf')
    dist = [[INF] * (k + 1) for _ in range(n)]
    dist[0][1] = 0
    heap = [(0, 0, 1)]
    while heap:
        d, v, run = heapq.heappop(heap)
        if d > dist[v][run]:
            continue
        for w, c in graph[v]:
            nxt = run + 1 if labels[w] == labels[v] else 1
            if nxt <= k and d + c < dist[w][nxt]:
                dist[w][nxt] = d + c
                heapq.heappush(heap, (d + c, w, nxt))
    best = min(dist[n - 1][1:])
    return -1 if best == INF else best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with labels, k and edges.')
  const { labels, k, edges } = input
  if (typeof labels !== 'string' || !/^[a-z]{1,8}$/.test(labels)) throw new Error('labels is 1 to 8 lowercase letters, one per vertex.')
  if (!Number.isInteger(k) || k < 1 || k > 4) throw new Error('k is an integer from 1 to 4.')
  if (!Array.isArray(edges) || edges.length > 12) throw new Error('edges holds up to 12 [from, to, weight] triples.')
  const n = labels.length
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !Number.isInteger(e[0]) || !Number.isInteger(e[1]) || !Number.isInteger(e[2])) throw new Error('Each edge is [from, to, weight] with integers.')
    if (e[0] < 0 || e[0] >= n || e[1] < 0 || e[1] >= n || e[0] === e[1]) throw new Error('Edges use valid, non-self vertex numbers.')
    if (e[2] < 1 || e[2] > 20) throw new Error('Edge weights are integers from 1 to 20.')
  }
  return { labels, k, edges }
}

export function buildTrace({ labels, k, edges }) {
  const n = labels.length
  const INF = Infinity
  const dist = Array.from({ length: n }, () => Array(k + 1).fill(INF))
  const done = Array.from({ length: n }, () => Array(k + 1).fill(false))
  dist[0][1] = 0
  const frames = []
  const snap = () => dist.map(row => row.slice(1).map(d => (d === INF ? null : d)))
  const doneSnap = () => done.map(row => row.slice(1))
  const push = (phase, codeText, pyText, cur, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), current: cur, table: snap(), done: doneSnap(), k, labels, message, ...extra,
  })
  push('start', 'start state (node 0, run 1)', 'dist[0][1] = 0', null, 'Start at node 0 with a run of 1 at distance 0.')
  for (;;) {
    let pick = null
    for (let v = 0; v < n; v++) for (let r = 1; r <= k; r++) {
      if (!done[v][r] && dist[v][r] < INF && (pick === null || dist[v][r] < dist[pick[0]][pick[1]])) pick = [v, r]
    }
    if (pick === null) break
    const [v, run] = pick
    done[v][run] = true
    push('pick', 'pick the unfinished state', 'heapq.heappop', { v, run }, `Finalise node ${v} (label ${labels[v]}) with run ${run} at distance ${dist[v][run]}.`)
    for (const [from, to, c] of edges) {
      if (from !== v) continue
      const nxt = labels[to] === labels[v] ? run + 1 : 1
      if (nxt > k) {
        push('relax', 'if next run is at most k', 'if nxt <= k', { v, run, w: to, nxt, c }, `Edge ${v} to ${to} would make a run of ${nxt}, above k = ${k}; skip it.`)
        continue
      }
      const candidate = dist[v][run] + c
      const improves = candidate < dist[to][nxt]
      if (improves) dist[to][nxt] = candidate
      push('relax', 'if next run is at most k', 'if nxt <= k and', { v, run, w: to, nxt, c, candidate, improves }, improves
        ? `Edge ${v} to ${to} reaches state (${to}, run ${nxt}) at distance ${candidate}.`
        : `Edge ${v} to ${to} does not improve state (${to}, run ${nxt}).`)
    }
  }
  const best = Math.min(...dist[n - 1].slice(1))
  const result = best === INF ? -1 : best
  push('done', 'return the smallest distance', 'return -1', null, result === -1 ? 'No valid walk reaches the last node.' : `The cheapest valid walk costs ${result}.`)
  return { input: { labels, k, edges }, result, frames }
}
