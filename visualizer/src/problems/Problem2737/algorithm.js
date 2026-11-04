// LeetCode 2737: Find the Closest Marked Node.
// Dijkstra from the start vertex. Vertices are settled in order of distance, so the first
// marked vertex that settles is the closest marked vertex. A start that is marked costs 0.
// The draft has no verified bounds. The trace requires non-negative integer weights (Dijkstra's
// requirement) and caps the visualization at 12 vertices and 30 edges.

const MAX_VISUAL_VERTICES = 12
const MAX_VISUAL_EDGES = 30

const PYTHON_SOURCE = `import heapq, json, sys

def closest_marked(n, edges, s, marked):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((v, w))
    marked_set = set(marked)
    dist = [float('inf')] * n
    dist[s] = 0
    heap = [(0, s)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue
        if u in marked_set:
            return d
        for v, w in graph[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (d + w, v))
    return -1

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    print(closest_marked(data["n"], data["edges"], data["s"], data["marked"]))
`

export const code = `function closestMarked(n, edges, s, marked) {
  const graph = adjacency(n, edges); // graph ← adjacency list built from edges
  const dist = Array(n).fill(Infinity); dist[s] = 0; // dist[s] ← 0 and every other dist ← infinity
  const settled = new Set();
  while (settled.size < n) { // WHILE some unsettled vertex has a finite distance
    const u = nearestUnsettled(dist, settled); // u ← unsettled vertex with the smallest distance
    if (u === -1) break;
    settled.add(u); // mark u as settled
    if (marked.includes(u)) return dist[u]; // IF u is in marked THEN RETURN dist[u]
    for (const [v, w] of graph[u]) { // FOR each edge (u, v, w) out of u
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w; // IF dist[u] + w < dist[v] THEN dist[v] ← dist[u] + w
    }
  }
  return -1; // RETURN -1
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const PY = PYTHON_SOURCE.split('\n')
const P = s => {
  const index = PY.findIndex(text => text.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, s and marked.')
  const { n, edges, s, marked } = input
  if (!Number.isInteger(n) || n < 1) throw new Error('n is a positive integer number of vertices.')
  if (!Array.isArray(edges)) throw new Error('edges is a list of [from, to, weight] triples.')
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3 || !edge.every(Number.isInteger)) throw new Error('Each edge is [from, to, weight] with integers.')
    const [u, v, w] = edge
    if (u < 0 || u >= n || v < 0 || v >= n) throw new Error('Edge endpoints must be vertices from 0 to n - 1.')
    if (w < 0) throw new Error('Weights must be non-negative (Dijkstra requirement).')
  }
  if (!Number.isInteger(s) || s < 0 || s >= n) throw new Error('s is a vertex from 0 to n - 1.')
  if (!Array.isArray(marked) || marked.some(v => !Number.isInteger(v) || v < 0 || v >= n)) throw new Error('marked is a list of vertices from 0 to n - 1.')
  return { n, edges, s, marked }
}

export function buildTrace({ n, edges, s, marked }) {
  if (n > MAX_VISUAL_VERTICES || edges.length > MAX_VISUAL_EDGES) {
    throw new Error(`The visualization caps the graph at ${MAX_VISUAL_VERTICES} vertices and ${MAX_VISUAL_EDGES} edges.`)
  }
  const markedSet = new Set(marked)
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) adj[u].push({ to: v, w })
  const dist = Array(n).fill(Infinity)
  const settled = Array(n).fill(false)
  const frames = []
  const state = extra => ({
    dist: dist.map(d => (d === Infinity ? null : d)),
    settled: [...settled],
    ...extra,
  })

  frames.push({ phase: 'setup', pythonLine: P('graph = [[]'), activeLine: L('graph ← adjacency'), current: null, relax: null, answer: null,
    ...state({}), message: `Build ${edges.length} directed edge${edges.length === 1 ? '' : 's'} over ${n} vertices.` })
  dist[s] = 0
  frames.push({ phase: 'setup', pythonLine: P('dist[s] = 0'), activeLine: L('dist[s] ← 0'), current: null, relax: null, answer: null,
    ...state({}), message: `Start at vertex ${s} with distance 0; every other vertex is unknown (∞).` })

  let answer = -1
  for (;;) {
    let u = -1
    for (let v = 0; v < n; v += 1) {
      if (!settled[v] && dist[v] < Infinity && (u < 0 || dist[v] < dist[u])) u = v
    }
    if (u < 0) break
    settled[u] = true
    frames.push({ phase: 'pop', pythonLine: P('d, u = heapq.heappop'), activeLine: L('u ← unsettled vertex'), current: u, relax: null, answer: null,
      ...state({ marked: [...marked] }), message: `Settle vertex ${u} at distance ${dist[u]}, the smallest open distance.` })
    if (markedSet.has(u)) {
      answer = dist[u]
      frames.push({ phase: 'found', pythonLine: P('if u in marked_set'), activeLine: L('IF u is in marked'), current: u, relax: null, answer,
        ...state({}), message: `Vertex ${u} is marked. Nothing settled earlier was marked, so ${answer} is the closest.` })
      break
    }
    for (const { to, w } of adj[u]) {
      const candidate = dist[u] + w
      const improves = candidate < dist[to]
      frames.push({ phase: 'relax', pythonLine: P('if d + w < dist[v]'), activeLine: L('FOR each edge'), current: u,
        relax: { from: u, to, w, candidate, improves }, answer: null, ...state({}),
        message: `Edge ${u} to ${to} (weight ${w}) offers ${candidate} for vertex ${to}${improves ? ', which beats the current ' + (dist[to] === Infinity ? '∞' : dist[to]) : ', which does not beat the current value'}.` })
      if (improves) {
        dist[to] = candidate
        frames.push({ phase: 'relax', pythonLine: P('dist[v] = d + w'), activeLine: L('IF dist[u] + w'), current: u,
          relax: { from: u, to, w, candidate, improves }, answer: null, ...state({}),
          message: `Vertex ${to} now has distance ${candidate}.` })
      }
    }
  }
  if (answer < 0) {
    frames.push({ phase: 'done', pythonLine: P('return -1'), activeLine: L('RETURN -1'), current: null, relax: null, answer: -1,
      ...state({}), message: 'No marked vertex is reachable from the start, so the answer is -1.' })
  } else {
    frames.push({ phase: 'done', pythonLine: P('return d'), activeLine: L('IF u is in marked'), current: null, relax: null, answer,
      ...state({}), message: `Closest marked vertex is at distance ${answer}.` })
  }
  return { input: { n, edges, s, marked }, n, edges, s, marked, answer, frames }
}

export const pythonLineMap = {}
export const phases = [
  { id: 'setup', label: 'Read graph', description: 'Build the adjacency list and start distances.' },
  { id: 'pop', label: 'Settle vertex', description: 'Take the unsettled vertex with the smallest distance.' },
  { id: 'relax', label: 'Relax edges', description: 'Try to shorten distances through the settled vertex.' },
  { id: 'found', label: 'Marked hit', description: 'The first marked vertex to settle is the answer.' },
  { id: 'done', label: 'Answer', description: 'Report the distance, or -1 when no marked vertex is reachable.' },
]
