const ERROR = 'Enter {"n":3,"edges":[[u,v,length],...],"disappear":[t0,...]} with 2 to 7 nodes numbered from 0, up to 12 undirected edges with length 1 to 6, and one disappearance time from 1 to 20 for each node.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Number.isInteger(value.n) || !Array.isArray(value.edges) || !Array.isArray(value.disappear)) throw new Error(ERROR)
  const { n, edges, disappear } = value
  if (n < 2 || n > 7 || edges.length > 12 || disappear.length !== n) throw new Error(ERROR)
  if (!disappear.every(t => Number.isInteger(t) && t >= 1 && t <= 20)) throw new Error(ERROR)
  const edgesOk = edges.every(e => Array.isArray(e) && e.length === 3 && e.every(Number.isInteger) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[0] !== e[1] && e[2] >= 1 && e[2] <= 6)
  if (!edgesOk) throw new Error(ERROR)
  return { n, edges, disappear }
}

export const code = `earliest time each node can be visited, or -1
arrive[0] = 0 and every other arrive = infinity
heap = [(0, 0)] ordered by time
while the heap is not empty
  pop (t, u) with the smallest time
  if t > arrive[u] then continue
  for each edge from u to v with length
    time = t + length
    if time < disappear[v] and time < arrive[v] then record it and push it
return arrive, with -1 for every node still at infinity`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, disappear }) {
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v, len] of edges) { graph[u].push([v, len]); graph[v].push([u, len]) }
  const arrive = new Array(n).fill(Infinity)
  arrive[0] = 0
  const settled = new Array(n).fill(false)
  const frames = [{ phase: 'start', activeLine: L('arrive[0] = 0'), node: 0, dist: [...arrive], settled: [...settled], message: `Leave node 0 at time 0. A node can be visited only at a time strictly before it disappears.` }]
  for (;;) {
    let u = -1
    for (let x = 0; x < n; x++) if (!settled[x] && arrive[x] < Infinity && (u === -1 || arrive[x] < arrive[u])) u = x
    if (u === -1) break
    settled[u] = true
    const notes = []
    for (const [v, len] of graph[u]) {
      const time = arrive[u] + len
      if (time >= disappear[v]) { notes.push(`node ${v} at ${time} is too late (it disappears at ${disappear[v]})`); continue }
      if (time < arrive[v]) { arrive[v] = time; notes.push(`node ${v} improves to ${time}`) }
    }
    frames.push({ phase: 'settle', activeLine: L('pop (t, u)'), node: u, dist: [...arrive], settled: [...settled], message: `Visit node ${u} at time ${arrive[u]}.${notes.length ? ` Neighbours: ${notes.join('; ')}.` : ''}` })
  }
  const result = arrive.map(a => (a === Infinity ? -1 : a))
  frames.push({ phase: 'done', activeLine: L('return arrive'), node: -1, dist: [...arrive], settled: [...settled], message: `Earliest visit times: [${result.join(', ')}].` })
  return { input: { n, edges, disappear }, result, frames }
}

export const python = `import heapq

def minimum_visit_times(n, edges, disappear):
    graph = [[] for _ in range(n)]
    for u, v, length in edges:
        graph[u].append((v, length))
        graph[v].append((u, length))
    inf = float('inf')
    arrive = [inf] * n
    arrive[0] = 0
    heap = [(0, 0)]
    while heap:
        t, u = heapq.heappop(heap)
        if t > arrive[u]:
            continue
        for v, length in graph[u]:
            time = t + length
            if time < disappear[v] and time < arrive[v]:
                arrive[v] = time
                heapq.heappush(heap, (time, v))
    return [a if a < inf else -1 for a in arrive]
`
