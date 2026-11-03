export const phases = [
  { id: 'start', label: 'Input', description: 'Every node starts as its own group; no edge has been used.' },
  { id: 'sort', label: 'Sort', description: 'Sort edges by length and queries by their limit, remembering each query position.' },
  { id: 'union', label: 'Join edges', description: 'For the current limit, join the groups of every edge strictly shorter than it.' },
  { id: 'answer', label: 'Answer query', description: 'Two nodes are connected under this limit when they share a group.' },
  { id: 'done', label: 'Return', description: 'Answers appear in the original query order.' },
]

const LIMITS = { nodes: 200, edges: 400, queries: 400, value: 10000 }

export function parseInput(text) {
  let value
  try { value = JSON.parse(text) } catch { throw new Error('Enter a JSON object with "nodes", "edges" and "queries".') }
  if (!value || typeof value !== 'object') throw new Error('Enter a JSON object with "nodes", "edges" and "queries".')
  const { nodes, edges, queries } = value
  if (!Number.isInteger(nodes) || nodes < 1 || nodes > LIMITS.nodes) throw new Error(`nodes must be an integer from 1 to ${LIMITS.nodes}.`)
  const inRange = x => Number.isInteger(x) && x >= 0 && x < nodes
  const isValue = x => Number.isInteger(x) && x >= 1 && x <= LIMITS.value
  if (!Array.isArray(edges) || edges.length > LIMITS.edges) throw new Error(`Use up to ${LIMITS.edges} edges.`)
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 3 || !inRange(edge[0]) || !inRange(edge[1]) || !isValue(edge[2])) throw new Error('Each edge is [u, v, length] with valid node numbers and a length from 1 to 10000.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > LIMITS.queries) throw new Error(`Use 1 to ${LIMITS.queries} queries.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 3 || !inRange(query[0]) || !inRange(query[1]) || !isValue(query[2])) throw new Error('Each query is [p, q, limit] with valid node numbers and a limit from 1 to 10000.')
  }
  return { nodes, edges, queries }
}

export function buildTrace({ nodes, edges, queries }) {
  const parent = Array.from({ length: nodes }, (_, index) => index)
  const find = x => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }
    return x
  }
  const answers = queries.map(() => null)
  const snap = extra => ({ labels: parent.map((_, index) => find(index)), answers: [...answers], ...extra })
  const sortedEdges = edges.map(([u, v, w], index) => ({ u, v, w, index })).sort((a, b) => a.w - b.w || a.index - b.index)
  const order = queries.map(([p, q, limit], index) => ({ p, q, limit, index })).sort((a, b) => a.limit - b.limit || a.index - b.index)
  const frames = [{ phase: 'start', activeLine: 2, message: `${nodes} nodes, each alone in its group.`, snapshot: snap({ edge: null, query: null, next: 0 }) }]
  frames.push({ phase: 'sort', activeLine: 4, message: `Edges sorted by length; queries sorted by limit (${order.map(query => query.limit).join(', ')}).`, snapshot: snap({ edge: null, query: null, next: 0 }) })
  let next = 0
  for (const query of order) {
    while (next < sortedEdges.length && sortedEdges[next].w < query.limit) {
      const edge = sortedEdges[next]
      parent[find(edge.u)] = find(edge.v)
      next++
      frames.push({ phase: 'union', activeLine: 8, message: `Edge ${edge.u}-${edge.v} (length ${edge.w}) is shorter than limit ${query.limit}; join their groups.`, snapshot: snap({ edge: edge.index, query: query.index, next, limit: query.limit, p: query.p, q: query.q }) })
    }
    answers[query.index] = find(query.p) === find(query.q)
    frames.push({ phase: 'answer', activeLine: 9, message: `Query ${query.index}: ${query.p} and ${query.q} ${answers[query.index] ? 'share a group' : 'are in different groups'} under limit ${query.limit}.`, snapshot: snap({ edge: null, query: query.index, next, limit: query.limit, p: query.p, q: query.q }) })
  }
  frames.push({ phase: 'done', activeLine: 10, message: 'Return the answers in query order.', snapshot: snap({ edge: null, query: null, next, result: [...answers] }) })
  return { input: { nodes, edges, queries }, result: answers, frames }
}

export const python = `def distance_limited_paths_exist(n, edge_list, queries):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    edge_list = sorted(edge_list, key=lambda e: e[2])
    order = sorted(range(len(queries)), key=lambda i: queries[i][2])
    answer = [False] * len(queries)
    e = 0
    for qi in order:
        p, q, limit = queries[qi]
        while e < len(edge_list) and edge_list[e][2] < limit:
            u, v, _ = edge_list[e]
            parent[find(u)] = find(v)
            e += 1
        answer[qi] = find(p) == find(q)
    return answer`

export const code = [
  'FUNCTION edgeLimitedPaths(n, edges, queries)',
  '    parent[i] = i for every node',
  '    sort edges by length ascending',
  '    order = query positions sorted by limit ascending',
  '    next = 0',
  '    FOR EACH query IN order',
  '        WHILE next < edge count AND edge[next].length < query.limit',
  '            UNION the groups of edge[next]; next = next + 1',
  '        answer[query.position] = same group(query.p, query.q)',
  '    RETURN answer',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode activeLine -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 8, 4: 9, 5: 11, 6: 12, 7: 14, 8: 16, 9: 18, 10: 19 }
