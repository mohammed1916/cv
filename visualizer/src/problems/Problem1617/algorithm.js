export const phases = [
  { id: 'start', label: 'Start', description: 'Read the tree and measure the distance between every pair of cities.' },
  { id: 'enumerate', label: 'Choose a subset', description: 'Take the next subset of cities, written as a bitmask, with at least two cities.' },
  { id: 'connect', label: 'Check connected', description: 'A subset is a subtree only when its cities are linked to each other without leaving the subset.' },
  { id: 'count', label: 'Count by diameter', description: 'Add the subtree to the count for its largest pairwise distance.' },
  { id: 'done', label: 'Result', description: 'Report how many subtrees have each diameter.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object such as {"n": 4, "edges": [[1, 2], [2, 3], [2, 4]]}.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n must be an integer from 2 to 10 for this visualization.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must list exactly ${n - 1} pairs for a tree on ${n} cities.`)
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 1 && v <= n)) throw new Error('Each edge is a pair of city numbers from 1 to n.')
    const [u, v] = edge
    if (u === v) throw new Error('An edge cannot join a city to itself.')
    const ru = find(u - 1), rv = find(v - 1)
    if (ru === rv) throw new Error('The edges contain a cycle, so they do not form a tree.')
    parent[ru] = rv
  }
  return { n, edges }
}

// Lines of the solver the story points at (1-based, matching `code` below).
const L = s => code.findIndex(c => c.text.includes(s)) + 1
const P = s => python.split('\n').findIndex(line => line.includes(s)) + 1

function treeDistances(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u - 1].push(v - 1); adj[v - 1].push(u - 1) }
  return Array.from({ length: n }, (_, source) => {
    const dist = Array(n).fill(-1)
    dist[source] = 0
    const queue = [source]
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head]
      for (const w of adj[u]) if (dist[w] < 0) { dist[w] = dist[u] + 1; queue.push(w) }
    }
    return dist
  })
}

function reachWithin(mask, members, adj) {
  const seen = new Set([members[0]])
  const stack = [members[0]]
  while (stack.length) {
    const u = stack.pop()
    for (const w of adj[u]) if ((mask >> w) & 1 && !seen.has(w)) { seen.add(w); stack.push(w) }
  }
  return [...seen]
}

export function buildTrace({ n, edges }) {
  const frames = []
  const at = (pseudo, py) => ({ activeLine: L(pseudo), pythonLine: P(py) })
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u - 1].push(v - 1); adj[v - 1].push(u - 1) }
  const dist = treeDistances(n, edges)
  const answer = Array(n - 1).fill(0)
  let tried = 0

  frames.push({ phase: 'start', ...at('dist = tree distances', 'dist = all_pairs'),
    message: `Tree on ${n} cities. Every pair of cities has one path, and its length is the distance between them.`,
    snapshot: { n, edges, mask: 0, members: [], reached: [], connected: null, diameter: null, answer: [...answer], tried } })

  for (let mask = 1; mask < (1 << n); mask++) {
    const members = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) members.push(i)
    if (members.length < 2) continue
    tried++
    frames.push({ phase: 'enumerate', ...at('for mask from 1', 'for mask in range'),
      message: `Subset ${members.map(i => i + 1).join(', ')} is the next one to test.`,
      snapshot: { n, edges, mask, members, reached: [], connected: null, diameter: null, answer: [...answer], tried } })
    const reached = reachWithin(mask, members, adj)
    const connected = reached.length === members.length
    frames.push({ phase: 'connect', ...at('not connected(members)', 'is_connected(mask'),
      message: connected
        ? `Starting from city ${members[0] + 1} the search reaches all ${members.length} cities inside the subset, so it is a subtree.`
        : `Starting from city ${members[0] + 1} the search reaches only ${reached.length} of ${members.length} cities inside the subset, so it is not connected.`,
      snapshot: { n, edges, mask, members, reached, connected, diameter: null, answer: [...answer], tried } })
    if (!connected) continue
    const diameter = Math.max(...members.flatMap(u => members.map(v => dist[u][v])))
    answer[diameter - 1]++
    frames.push({ phase: 'count', ...at('answer[d - 1] += 1', 'answer[d - 1] += 1'),
      message: `This subtree has largest distance ${diameter}. Count ${answer[diameter - 1]} now sits at diameter ${diameter}.`,
      snapshot: { n, edges, mask, members, reached, connected: true, diameter, answer: [...answer], tried } })
  }

  frames.push({ phase: 'done', ...at('return answer', 'return answer'),
    message: `Counts for diameters 1 to ${n - 1}: [${answer.join(', ')}].`,
    snapshot: { n, edges, mask: null, members: [], reached: [], connected: null, diameter: null, answer: [...answer], tried } })
  return { input: { n, edges }, result: answer, frames }
}

export const code = `count subtrees (n, edges):
  dist = tree distances between all pairs
  answer = zeros of length n - 1
  for mask from 1 to 2^n - 1:
    members = cities in mask
    if size(members) < 2: skip
    if not connected(members): skip
    d = largest dist among members
    answer[d - 1] += 1
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def count_subtrees(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u - 1].append(v - 1)
        adj[v - 1].append(u - 1)
    dist = all_pairs(n, adj)
    answer = [0] * (n - 1)
    for mask in range(1, 1 << n):
        members = [i for i in range(n) if mask >> i & 1]
        if len(members) < 2:
            continue
        if not is_connected(mask, members, adj):
            continue
        d = max(dist[u][v] for u in members for v in members)
        answer[d - 1] += 1
    return answer

def all_pairs(n, adj):
    result = []
    for s in range(n):
        d = [-1] * n
        d[s] = 0
        queue = [s]
        for u in queue:
            for w in adj[u]:
                if d[w] < 0:
                    d[w] = d[u] + 1
                    queue.append(w)
        result.append(d)
    return result

def is_connected(mask, members, adj):
    seen = {members[0]}
    stack = [members[0]]
    while stack:
        u = stack.pop()
        for w in adj[u]:
            if mask >> w & 1 and w not in seen:
                seen.add(w)
                stack.append(w)
    return len(seen) == len(members)
`
