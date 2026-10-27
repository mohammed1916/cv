const ERROR = 'Enter {"n":4,"edges":[[u,v,w],...],"operations":[["addEdge",[u,v,w]],["shortestPath",a,b],...]} with 2 to 6 nodes numbered from 0, up to 8 initial edges and 10 operations. Weights are 1 to 10.'

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value !== 'object' || !Array.isArray(value.edges) || !Array.isArray(value.operations) || !Number.isInteger(value.n)) throw new Error(ERROR)
  const { n, edges, operations } = value
  if (n < 2 || n > 6 || edges.length > 8 || operations.length < 1 || operations.length > 10) throw new Error(ERROR)
  const edgeOk = e => Array.isArray(e) && e.length === 3 && Number.isInteger(e[0]) && Number.isInteger(e[1]) && Number.isInteger(e[2]) && e[0] >= 0 && e[0] < n && e[1] >= 0 && e[1] < n && e[2] >= 1 && e[2] <= 10
  if (!edges.every(edgeOk)) throw new Error(ERROR)
  for (const op of operations) {
    if (!Array.isArray(op) || (op[0] === 'addEdge' && edgeOk(op[1]) && op.length === 2)) continue
    if (op[0] === 'shortestPath' && op.length === 3 && Number.isInteger(op[1]) && Number.isInteger(op[2]) && op[1] >= 0 && op[1] < n && op[2] >= 0 && op[2] < n) continue
    throw new Error(ERROR)
  }
  return { n, edges, operations }
}

export const code = `answer shortestPath queries on a directed graph that grows
build the adjacency lists from the initial edges
answers = empty list
for each operation in order
  if it is addEdge(u, v, w) then append (v, w) to the list of u
  if it is shortestPath(a, b) then
    run Dijkstra from a over the edges added so far
    add the distance to b, or -1 when b is unreachable, to answers
return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ n, edges, operations }) {
  const current = edges.map(e => [...e])
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of current) adj[u].push([v, w])
  const answers = []
  const frames = [{ phase: 'start', activeLine: L('build the adjacency lists'), edges: current.map(e => [...e]), dist: null, node: -1, answers: [], message: `Start with ${current.length} edge(s). Edges are directed and can be added later.` }]
  operations.forEach((op, index) => {
    if (op[0] === 'addEdge') {
      const [u, v, w] = op[1]
      adj[u].push([v, w])
      current.push([u, v, w])
      frames.push({ phase: 'add', activeLine: L('if it is addEdge'), edges: current.map(e => [...e]), dist: null, node: -1, answers: [...answers], message: `Operation ${index + 1}: add edge ${u} to ${v} with weight ${w}.` })
      return
    }
    const [, source, target] = op
    const dist = new Array(n).fill(Infinity)
    dist[source] = 0
    const settled = new Array(n).fill(false)
    frames.push({ phase: 'query', activeLine: L('run Dijkstra from a'), edges: current.map(e => [...e]), dist: [...dist], node: source, answers: [...answers], message: `Operation ${index + 1}: shortest path from ${source} to ${target}. Start Dijkstra at ${source}.` })
    for (;;) {
      let u = -1
      for (let x = 0; x < n; x++) if (!settled[x] && dist[x] < Infinity && (u === -1 || dist[x] < dist[u])) u = x
      if (u === -1) break
      settled[u] = true
      for (const [v, w] of adj[u]) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w
      frames.push({ phase: 'query', activeLine: L('run Dijkstra from a'), edges: current.map(e => [...e]), dist: [...dist], node: u, answers: [...answers], message: `Settle node ${u} at distance ${dist[u]} and relax its outgoing edges.` })
    }
    const result = dist[target] === Infinity ? -1 : dist[target]
    answers.push(result)
    frames.push({ phase: 'answer', activeLine: L('add the distance to b'), edges: current.map(e => [...e]), dist: [...dist], node: target, answers: [...answers], message: `Shortest path from ${source} to ${target}: ${result}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), edges: current.map(e => [...e]), dist: null, node: -1, answers: [...answers], message: `Answers in order: [${answers.join(', ')}].` })
  return { input: { n, edges, operations }, result: answers, frames }
}

export const python = `import heapq

def run_graph_operations(n, edges, operations):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
    answers = []
    for operation in operations:
        if operation[0] == 'addEdge':
            u, v, w = operation[1]
            graph[u].append((v, w))
        elif operation[0] == 'shortestPath':
            source, target = operation[1], operation[2]
            dist = [float('inf')] * n
            dist[source] = 0
            heap = [(0, source)]
            while heap:
                d, u = heapq.heappop(heap)
                if d > dist[u]:
                    continue
                for v, w in graph[u]:
                    if d + w < dist[v]:
                        dist[v] = d + w
                        heapq.heappush(heap, (dist[v], v))
            answers.append(dist[target] if dist[target] < float('inf') else -1)
    return answers
`
