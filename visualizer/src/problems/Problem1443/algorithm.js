export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with n, edges, and has_apple.')
  const { n, edges, has_apple: apples } = data
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n must be an integer from 1 to 12.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error(`edges must list exactly ${n - 1} pairs for a tree on ${n} vertices.`)
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = v => (parent[v] === v ? v : (parent[v] = find(parent[v])))
  for (const edge of edges) {
    if (!Array.isArray(edge) || edge.length !== 2 || !edge.every(v => Number.isInteger(v) && v >= 0 && v < n)) throw new Error('Each edge is a pair of vertices from 0 to n-1.')
    const [a, b] = edge
    if (find(a) === find(b)) throw new Error('The edges must form a tree: no cycles and no repeated edges.')
    parent[find(a)] = find(b)
  }
  if (!Array.isArray(apples) || apples.length !== n || apples.some(v => typeof v !== 'boolean')) throw new Error(`has_apple must have ${n} true or false entries.`)
  return { n, edges, has_apple: apples }
}

export function buildTrace(input) {
  const { n, edges, has_apple: apples } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const frames = []
  let total = 0
  const finished = []
  const needs = {}
  const frame = (phase, line, node, message) => frames.push({ phase, activeLine: line, node, total, finished: [...finished], needs: { ...needs }, message })
  frame('start', L('set total time to 0'), null, 'Start at vertex 0 with no time spent.')
  const walk = (node, parentNode) => {
    let needed = apples[node]
    frame('enter', L('set needed to whether'), node, `Enter vertex ${node}. It ${apples[node] ? 'has' : 'has no'} an apple.`)
    for (const next of adj[node]) {
      if (next === parentNode) continue
      if (walk(next, node)) {
        total += 2
        needed = true
        needs[next] = true
        frame('trip', L('add 2 to total time'), next, `The subtree under ${next} needs a visit, so the edge back to ${node} costs 2 seconds.`)
      }
    }
    finished.push(node)
    frame('return', L('return needed'), node, `Vertex ${node} ${needed ? 'must be visited' : 'can be skipped'}.`)
    return needed
  }
  walk(0, -1)
  frame('done', L('return total time'), null, `All apples are collected in ${total} seconds.`)
  return { input, result: total, frames }
}

export const code = `minimum time to collect all apples, starting and ending at vertex 0
  build a neighbour list for each vertex from the edges
  set total time to 0
  call walk on vertex 0 with no parent
  return total time

walk(node, parent)
  set needed to whether node has an apple
  for each neighbour of node except the parent, do
    if walk on that neighbour returns true then
      add 2 to total time
      set needed to true
  return needed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_time_to_collect(n, edges, has_apple):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    total = 0

    def walk(node, parent):
        nonlocal total
        needed = has_apple[node]
        for nxt in adj[node]:
            if nxt == parent:
                continue
            if walk(nxt, node):
                total += 2
                needed = True
        return needed

    walk(0, -1)
    return total
`
