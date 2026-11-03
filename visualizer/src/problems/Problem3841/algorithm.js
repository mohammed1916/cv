const code = [
  'build an adjacency list from the edges',
  'for each query in order',
  'if the query is an update then set that letter',
  'else find the path between the two nodes',
  'count the letters on the path',
  'answer true when at most one letter count is odd',
  'return the answers',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges, s and queries.')
  const { n, edges, s, queries } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must list n - 1 pairs.')
  for (const pair of edges) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is a pair of node labels below n.')
  }
  if (typeof s !== 'string' || s.length !== n || !/^[a-z]+$/.test(s)) throw new Error('s has n lowercase letters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 12) throw new Error('queries has 1 to 12 entries.')
  return { n, edges, s, queries }
}

function treePath(adj, from, to) {
  const parent = new Array(adj.length).fill(-2)
  parent[from] = -1
  const queue = [from]
  for (let head = 0; head < queue.length; head++) {
    for (const next of adj[queue[head]]) if (parent[next] === -2) { parent[next] = queue[head]; queue.push(next) }
  }
  if (parent[to] === -2) throw new Error('The edges do not connect those two nodes.')
  const path = []
  for (let node = to; node !== -1; node = parent[node]) path.unshift(node)
  return path
}

export function buildTrace(input) {
  const { n, edges, queries } = input
  const chars = [...input.s]
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const frames = []
  const answers = []
  frames.push({ chars: [...chars], path: [], odd: null, answer: null, phase: 'setup', activeLine: L('adjacency'), message: `Tree built; letters are ${chars.join('')}.` })
  queries.forEach((query, index) => {
    const [kind, a, b] = query.trim().split(/\s+/)
    if (kind === 'update') {
      chars[Number(a)] = b
      frames.push({ chars: [...chars], path: [], odd: null, answer: null, phase: 'update', activeLine: L('update'), message: `Node ${a} becomes ${b}.` })
      return
    }
    if (kind !== 'query') throw new Error(`Query ${index + 1} must start with update or query.`)
    const path = treePath(adj, Number(a), Number(b))
    const counts = new Map()
    for (const node of path) counts.set(chars[node], (counts.get(chars[node]) || 0) + 1)
    const odd = [...counts.values()].filter(c => c % 2 === 1).length
    const answer = odd <= 1
    answers.push(answer)
    frames.push({ chars: [...chars], path, odd, answer: null, phase: 'query', activeLine: L('else find the path'), message: `Path ${path.map(i => chars[i]).join('')} has ${odd} odd letter count${odd === 1 ? '' : 's'}.` })
    frames.push({ chars: [...chars], path, odd, answer, phase: 'answer', activeLine: L('answer true'), message: answer ? 'At most one odd count: rearrangeable into a palindrome.' : 'Two or more odd counts: no palindrome arrangement.' })
  })
  frames.push({ chars: [...chars], path: [], odd: null, answer: null, phase: 'done', activeLine: L('return the answers'), message: `Answers: ${answers.join(', ')}.` })
  return { input, answers, frames }
}

export { code }
export const python = `def path_palindrome_queries(n, edges, s, queries):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    chars = list(s)
    answers = []
    for query in queries:
        kind, a, b = query.split()
        if kind == 'update':
            chars[int(a)] = b
            continue
        path = tree_path(adj, int(a), int(b))
        counts = Counter(chars[node] for node in path)
        odd = sum(count % 2 for count in counts.values())
        answers.append(odd <= 1)
    return answers`
