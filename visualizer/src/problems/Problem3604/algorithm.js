const ERROR = 'Enter {"n":3,"edges":[[u,v,start,end],...]} with 2 to 6 nodes numbered from 0, 1 to 8 directed edges, no self-loops, and 0 <= start <= end <= 10. An edge can be used to leave u at any time t with start <= t <= end, and it arrives at v one second later.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges)) throw new Error(ERROR)
  const { n, edges } = value
  if (n < 2 || n > 6 || edges.length < 1 || edges.length > 8) throw new Error(ERROR)
  const ok = edges.every(e => Array.isArray(e) && e.length === 4 && e.every(Number.isInteger) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && e[2] >= 0 && e[2] <= e[3] && e[3] <= 10)
  if (!ok) throw new Error(ERROR)
  return { n, edges }
}

export const code = `earliest time to reach node n-1 from node 0, starting at time 0; -1 if impossible
best[0] = 0 and every other best = infinity
heap = [(0, 0)] ordered by time
while the heap is not empty
  pop (t, u) with the smallest t
  if t > best[u] then continue
  if u is node n-1 then return t
  for each edge (u to v, start, end)
    depart = the later of t and start
    if depart <= end and depart + 1 < best[v] then record it and push it
return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges }) {
  const best = new Array(n).fill(Infinity)
  best[0] = 0
  const done = new Array(n).fill(false)
  const frames = [{ phase: 'start', activeLine: L('best[0] = 0'), node: 0, edge: -1, best: [...best], done: [...done], message: 'Leave node 0 at time 0. An edge is usable from time start to time end, so you may need to wait at a node.' }]
  let result = -1
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!done[x] && best[x] < Infinity && (u === -1 || best[x] < best[u])) u = x
    if (u === -1) break
    done[u] = true
    if (u === n - 1) { result = best[u]; break }
    frames.push({ phase: 'settle', activeLine: L('pop (t, u)'), node: u, edge: -1, best: [...best], done: [...done], message: `Reach node ${u} at time ${best[u]}. Try each edge leaving it.` })
    edges.forEach(([a, b, s, e], i) => {
      if (a !== u) return
      const depart = Math.max(best[u], s)
      if (depart <= e && depart + 1 < best[b]) {
        best[b] = depart + 1
        frames.push({ phase: 'relax', activeLine: L('if depart <= end'), node: u, edge: i, best: [...best], done: [...done], message: `Edge ${a} to ${b} is open from ${s} to ${e}. Depart at ${depart}, arrive at ${depart + 1}.` })
      } else if (a === u) {
        frames.push({ phase: 'relax', activeLine: L('if depart <= end'), node: u, edge: i, best: [...best], done: [...done], message: depart > e ? `Edge ${a} to ${b} closes at ${e}, and it cannot be reached in time from ${best[u]}.` : `Arriving at ${b} at ${depart + 1} is no earlier than its current best.` })
      }
    })
  }
  frames.push({ phase: 'done', activeLine: L('return -1'), node: n - 1, edge: -1, best: [...best], done: [...done], message: result === -1 ? `Node ${n - 1} cannot be reached: return -1.` : `Earliest arrival at node ${n - 1}: ${result}.` })
  return { input: { n, edges }, result, frames }
}

export const python = `import heapq

def min_time_to_destination(n, edges):
    graph = [[] for _ in range(n)]
    for u, v, start, end in edges:
        graph[u].append((v, start, end))
    inf = float('inf')
    best = [inf] * n
    best[0] = 0
    heap = [(0, 0)]
    while heap:
        t, u = heapq.heappop(heap)
        if t > best[u]:
            continue
        if u == n - 1:
            return t
        for v, start, end in graph[u]:
            depart = max(t, start)
            if depart <= end and depart + 1 < best[v]:
                best[v] = depart + 1
                heapq.heappush(heap, (depart + 1, v))
    return -1
`
