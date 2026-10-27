export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and queries.')
  const { n, edges, queries } = input
  if (!Number.isInteger(n) || n < 2 || n > 8) throw new Error('n must be an integer from 2 to 8.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes needs n - 1 edges.')
  const parentOf = Array.from({ length: n }, (_, i) => i)
  const find = x => (parentOf[x] === x ? x : (parentOf[x] = find(parentOf[x])))
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 3) throw new Error('Each edge is [u, v, weight].')
    const [u, v, w] = e
    if (![u, v].every(x => Number.isInteger(x) && x >= 0 && x < n) || !Number.isInteger(w) || w < 1 || w > 9) throw new Error('Edges use nodes 0 to n-1 and weights 1 to 9.')
    if (find(u) === find(v)) throw new Error('The edges must form a tree without cycles.')
    parentOf[find(u)] = find(v)
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('Give 1 to 6 queries.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 3 || q.some(x => !Number.isInteger(x) || x < 0 || x >= n)) throw new Error('Each query is three nodes from 0 to n-1.')
  }
  return { n, edges, queries }
}

export function buildTrace({ n, edges, queries }) {
  const adjacency = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adjacency[u].push([v, w]); adjacency[v].push([u, w]) }
  const parent = Array(n).fill(-1)
  const level = Array(n).fill(0)
  const dist = Array(n).fill(0)
  const seen = Array(n).fill(false)
  seen[0] = true
  const order = [0]
  const frames = []
  frames.push({ phase: 'start', activeLine: L('root the tree at node 0'), query: -1, label: 'Root the tree at node 0 and record distances.', answers: [], message: 'Root the tree at node 0 and record each node’s distance from the root.' })
  for (const v of order) {
    for (const [w, c] of adjacency[v]) {
      if (!seen[w]) { seen[w] = true; parent[w] = v; level[w] = level[v] + 1; dist[w] = dist[v] + c; order.push(w) }
    }
  }
  const lca = (a, b) => {
    while (level[a] > level[b]) a = parent[a]
    while (level[b] > level[a]) b = parent[b]
    while (a !== b) { a = parent[a]; b = parent[b] }
    return a
  }
  const distance = (a, b) => dist[a] + dist[b] - 2 * dist[lca(a, b)]
  const answers = []
  queries.forEach(([a, b, c], qi) => {
    frames.push({ phase: 'query', activeLine: L('for each query'), query: qi, label: `Query ${qi}: nodes ${a}, ${b}, ${c}.`, answers: [...answers], message: `Query ${qi} joins nodes ${a}, ${b} and ${c}.` })
    const x = distance(a, b), y = distance(b, c), z = distance(a, c)
    frames.push({ phase: 'pair', activeLine: L('find the three distances'), query: qi, label: `d(${a},${b}) = ${x}, d(${b},${c}) = ${y}, d(${a},${c}) = ${z}`, answers: [...answers], message: `Pairwise distances are ${x}, ${y} and ${z}.` })
    const total = (x + y + z) / 2
    answers.push(total)
    frames.push({ phase: 'sum', activeLine: L('add half of'), query: qi, label: `Half the sum is ${total}.`, answers: [...answers], message: `Minimum subgraph weight for query ${qi}: ${total}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answers'), query: -1, label: `Answers: [${answers.join(', ')}]`, answers: [...answers], message: `Answers: [${answers.join(', ')}].` })
  return { input: { n, edges, queries }, result: answers, frames }
}

export const code = `minimum weight of a subgraph joining each query's three nodes
  root the tree at node 0 and record each node's distance from the root
  set answers to an empty list
  for each query (a, b, c)
    find the three distances between a and b, b and c, and a and c using lowest common ancestors
    add half of their sum to answers
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_weight_subgraphs(n, edges, queries):
    adjacency = [[] for _ in range(n)]
    for u, v, w in edges:
        adjacency[u].append((v, w))
        adjacency[v].append((u, w))
    parent = [-1] * n
    level = [0] * n
    dist = [0] * n
    seen = [False] * n
    seen[0] = True
    order = [0]
    for v in order:
        for w, c in adjacency[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                level[w] = level[v] + 1
                dist[w] = dist[v] + c
                order.append(w)

    def lca(a, b):
        while level[a] > level[b]:
            a = parent[a]
        while level[b] > level[a]:
            b = parent[b]
        while a != b:
            a = parent[a]
            b = parent[b]
        return a

    def distance(a, b):
        return dist[a] + dist[b] - 2 * dist[lca(a, b)]

    answers = []
    for a, b, c in queries:
        answers.append((distance(a, b) + distance(b, c) + distance(a, c)) // 2)
    return answers
`
