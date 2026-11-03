export const code = `start state (source, full power) at time zero; every other state is infinite
repeat until no unfinished state has a finite time
  pick the unfinished state (v, left) with the least time and finish it
  if v is the target, the walk ends here, so do not leave it
  otherwise, for each edge v to w with travel time t
    if left is at least cost[v], departing leaves left minus cost[v] and time plus t
    if that improves state (w, left after departure), update it
among target states, take the least time, then the greatest power left
return that pair, or [-1, -1] if the target is never reached`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq

def min_time_with_power(cost, edges, source, target, power):
    n = len(cost)
    graph = [[] for _ in range(n)]
    for u, v, t in edges:
        graph[u].append((v, t))
    INF = float('inf')
    best = [[INF] * (power + 1) for _ in range(n)]
    best[source][power] = 0
    heap = [(0, source, power)]
    while heap:
        time, v, left = heapq.heappop(heap)
        if time > best[v][left] or v == target:
            continue
        for w, t in graph[v]:
            if left >= cost[v]:
                nxt = left - cost[v]
                if time + t < best[w][nxt]:
                    best[w][nxt] = time + t
                    heapq.heappush(heap, (time + t, w, nxt))
    arrivals = [(best[target][p], -p) for p in range(power + 1) if best[target][p] < INF]
    if not arrivals:
        return [-1, -1]
    t, neg = min(arrivals)
    return [t, -neg]
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with cost, edges, source, target and power.')
  const { cost, edges, source, target, power } = input
  if (!Array.isArray(cost) || cost.length < 1 || cost.length > 8) throw new Error('cost holds 1 to 8 integers, one per vertex.')
  if (!cost.every(c => Number.isInteger(c) && c >= 1 && c <= 6)) throw new Error('Each cost is an integer from 1 to 6.')
  const n = cost.length
  if (!Number.isInteger(source) || source < 0 || source >= n || !Number.isInteger(target) || target < 0 || target >= n) throw new Error('source and target are valid vertices.')
  if (!Number.isInteger(power) || power < 1 || power > 8) throw new Error('power is an integer from 1 to 8.')
  if (!Array.isArray(edges) || edges.length > 12) throw new Error('edges holds up to 12 [from, to, time] triples.')
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3 || !e.every(Number.isInteger)) throw new Error('Each edge is [from, to, time] with integers.')
    if (e[0] < 0 || e[0] >= n || e[1] < 0 || e[1] >= n) throw new Error('Edge vertices are valid.')
    if (e[2] < 1 || e[2] > 20) throw new Error('Travel times are integers from 1 to 20.')
  }
  return { cost, edges, source, target, power }
}

export function buildTrace({ cost, edges, source, target, power }) {
  const n = cost.length
  const INF = Infinity
  const best = Array.from({ length: n }, () => Array(power + 1).fill(INF))
  const done = Array.from({ length: n }, () => Array(power + 1).fill(false))
  best[source][power] = 0
  const frames = []
  const snap = () => best.map(row => row.map(t => (t === INF ? null : t)))
  const doneSnap = () => done.map(row => [...row])
  const push = (phase, codeText, pyText, current, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), current, table: snap(), done: doneSnap(), power, target, cost, message, ...extra,
  })
  push('start', 'start state (source, full power)', 'best[source][power] = 0', null, `Start at vertex ${source} with power ${power} at time 0.`)
  for (;;) {
    let pick = null
    for (let v = 0; v < n; v++) for (let p = 0; p <= power; p++) {
      if (!done[v][p] && best[v][p] < INF && (pick === null || best[v][p] < best[pick[0]][pick[1]])) pick = [v, p]
    }
    if (pick === null) break
    const [v, left] = pick
    done[v][left] = true
    if (v === target) {
      push('arrive', 'if v is the target, the walk ends here', 'if time > best', { v, left }, `Reached the target at time ${best[v][left]} with ${left} power left. The walk ends here.`)
      continue
    }
    push('pick', 'pick the unfinished state', 'heapq.heappop', { v, left }, `Finish vertex ${v} with ${left} power at time ${best[v][left]}.`)
    for (const [from, to, t] of edges) {
      if (from !== v) continue
      if (left < cost[v]) {
        push('relax', 'if left is at least cost[v]', 'if left >= cost[v]', { v, left, w: to, t }, `Cannot leave ${v}: power ${left} is below its cost ${cost[v]}.`)
        continue
      }
      const after = left - cost[v]
      const candidate = best[v][left] + t
      const improves = candidate < best[to][after]
      if (improves) best[to][after] = candidate
      push('relax', 'if that improves state', 'if time + t < best', { v, left, w: to, t, after, candidate, improves }, improves
        ? `Depart ${v} to ${to}: power ${after} left, time ${candidate}.`
        : `Depart ${v} to ${to} does not improve state (${to}, power ${after}).`)
    }
  }
  const arrivals = []
  for (let p = 0; p <= power; p++) if (best[target][p] < INF) arrivals.push([best[target][p], -p])
  let result = [-1, -1]
  if (arrivals.length) {
    arrivals.sort((x, y) => x[0] - y[0] || x[1] - y[1])
    result = [arrivals[0][0], -arrivals[0][1]]
  }
  push('done', 'return that pair, or [-1, -1]', 'return [-1, -1]', null, `Answer: [${result.join(', ')}].`)
  return { input: { cost, edges, source, target, power }, result, frames }
}
