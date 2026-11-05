export const code = `function pathPalindromeQueries(n, edges, s, queries) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const chars = [...s]
  const answers = []
  for (const query of queries) {
    const [kind, a, b] = query.trim().split(/\\s+/)
    if (kind === 'update') {
      chars[Number(a)] = b
      continue
    }
    const path = treePath(adj, Number(a), Number(b))
    const counts = new Map()
    for (const node of path) counts.set(chars[node], (counts.get(chars[node]) || 0) + 1)
    const odd = [...counts.values()].filter(c => c % 2 === 1).length
    answers.push(odd <= 1)
  }
  return answers
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = key => {
  const hit = code.findIndex(c => c.text.includes(key))
  if (hit < 0) throw new Error(`Missing pseudocode line: ${key}`)
  return hit + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing python line: ${key}`)
  return index + 1
}

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
  frames.push({ pythonLine: P('adj = [[]'), chars: [...chars], path: [], odd: null, answer: null, phase: 'setup', activeLine: L('const adj'), message: `Tree built; letters are ${chars.join('')}.` })
  queries.forEach((query, index) => {
    const [kind, a, b] = query.trim().split(/\s+/)
    if (kind === 'update') {
      chars[Number(a)] = b
      frames.push({ pythonLine: P('chars[int(a)]'), chars: [...chars], path: [], odd: null, answer: null, phase: 'update', activeLine: L("if (kind === 'update')"), message: `Node ${a} becomes ${b}.` })
      return
    }
    if (kind !== 'query') throw new Error(`Query ${index + 1} must start with update or query.`)
    const path = treePath(adj, Number(a), Number(b))
    const counts = new Map()
    for (const node of path) counts.set(chars[node], (counts.get(chars[node]) || 0) + 1)
    const odd = [...counts.values()].filter(c => c % 2 === 1).length
    const answer = odd <= 1
    answers.push(answer)
    frames.push({ pythonLine: P('path = tree_path'), chars: [...chars], path, odd, answer: null, phase: 'query', activeLine: L('const path = treePath'), message: `Path ${path.map(i => chars[i]).join('')} has ${odd} odd letter count${odd === 1 ? '' : 's'}.` })
    frames.push({ pythonLine: P('answers.append'), chars: [...chars], path, odd, answer, phase: 'answer', activeLine: L('answers.push(odd'), message: answer ? 'At most one odd count: rearrangeable into a palindrome.' : 'Two or more odd counts: no palindrome arrangement.' })
  })
  frames.push({ pythonLine: P('return answers'), chars: [...chars], path: [], odd: null, answer: null, phase: 'done', activeLine: L('return answers'), message: `Answers: ${answers.join(', ')}.` })
  return { input, answers, frames }
}

export const python = `from collections import Counter, deque

def tree_path(adj, start, goal):
    parent = {start: None}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for nxt in adj[node]:
            if nxt not in parent:
                parent[nxt] = node
                queue.append(nxt)
    path = []
    node = goal
    while node is not None:
        path.append(node)
        node = parent[node]
    return path[::-1]

def path_palindrome_queries(n, edges, s, queries):
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
    return answers
`
