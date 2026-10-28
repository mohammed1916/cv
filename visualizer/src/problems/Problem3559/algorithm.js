const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges and queries, for example {"n":3,"edges":[[1,2],[1,3]],"queries":[[2,3]]}.')
  const { n, edges, queries } = data
  if (!Number.isInteger(n) || n < 2 || n > 10) throw new Error('n must be an integer from 2 to 10.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('edges must have n - 1 pairs.')
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || e.some(x => !Number.isInteger(x) || x < 1 || x > n)) throw new Error('Each edge is a pair of nodes from 1 to n.')
    adj[e[0]].push(e[1])
    adj[e[1]].push(e[0])
  }
  const reached = new Set([1])
  const stack = [1]
  while (stack.length) for (const w of adj[stack.pop()]) if (!reached.has(w)) { reached.add(w); stack.push(w) }
  if (reached.size !== n) throw new Error('edges must form a tree.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 6) throw new Error('queries must have 1 to 6 pairs.')
  for (const q of queries) {
    if (!Array.isArray(q) || q.length !== 2 || q.some(x => !Number.isInteger(x) || x < 1 || x > n)) throw new Error('Each query is a pair of nodes from 1 to n.')
  }
  return { n, edges: edges.map(e => [...e]), queries: queries.map(q => [...q]) }
}

export function buildTrace(input) {
  const { n, edges, queries } = input
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const parent = Array(n + 1).fill(0)
  const depth = Array(n + 1).fill(0)
  const seen = Array(n + 1).fill(false)
  seen[1] = true
  const order = [1]
  for (let i = 0; i < order.length; i++) {
    const v = order[i]
    for (const w of adj[v]) if (!seen[w]) { seen[w] = true; parent[w] = v; depth[w] = depth[v] + 1; order.push(w) }
  }
  const frames = [{ phase: 'start', activeLine: L('root the tree at node 1'), query: null, answer: null, message: 'Root the tree at node 1 so every node knows its depth and parent.' }]
  const answers = []
  for (const [u, v] of queries) {
    let a = u
    let b = v
    let length = 0
    while (a !== b) {
      if (depth[a] < depth[b]) [a, b] = [b, a]
      a = parent[a]
      length++
    }
    const ways = length === 0 ? 0 : 2 ** (length - 1) % MOD
    answers.push(ways)
    frames.push({ phase: 'query', activeLine: L('climb the deeper node'), query: [u, v], answer: ways, message: `Path ${u} to ${v} has ${length} edge${length === 1 ? '' : 's'}, so it has ${ways} odd assignments.` })
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), query: null, answer: null, message: 'Every query has been answered.' })
  return { input, result: answers, frames }
}

export const code = `odd path weight ways (n, edges, queries)
  root the tree at node 1 and record each node's parent and depth
  set answers to an empty list
  for each query (u, v)
    set length to 0
    while u is not v
      climb the deeper node one step toward the root and add one to length
    if length is 0 then the ways are 0
    otherwise the ways are 2 to the power length minus 1, modulo 1000000007
    append the ways to answers
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def odd_path_ways(n, edges, queries):
    MOD = 10 ** 9 + 7
    adj = [[] for _ in range(n + 1)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    parent = [0] * (n + 1)
    depth = [0] * (n + 1)
    seen = [False] * (n + 1)
    seen[1] = True
    order = [1]
    for v in order:
        for w in adj[v]:
            if not seen[w]:
                seen[w] = True
                parent[w] = v
                depth[w] = depth[v] + 1
                order.append(w)
    answers = []
    for u, v in queries:
        a, b = u, v
        length = 0
        while a != b:
            if depth[a] < depth[b]:
                a, b = b, a
            a = parent[a]
            length += 1
        answers.append(0 if length == 0 else pow(2, length - 1, MOD))
    return answers
`
