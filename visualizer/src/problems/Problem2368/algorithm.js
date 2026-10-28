export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, edges and restricted.')
  const { n, edges, restricted } = input
  if (!Number.isInteger(n) || n < 2 || n > 12) throw new Error('Use between 2 and 12 nodes.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has n - 1 edges.')
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  for (const e of edges) {
    if (!Array.isArray(e) || e.length !== 2 || !e.every(v => Number.isInteger(v) && v >= 0 && v < n) || e[0] === e[1]) throw new Error('Each edge joins two different nodes from 0 to n-1.')
    const a = find(e[0]), b = find(e[1])
    if (a === b) throw new Error('The edges must form a tree with no cycles.')
    parent[a] = b
  }
  if (!Array.isArray(restricted) || restricted.some(v => !Number.isInteger(v) || v < 1 || v >= n) || new Set(restricted).size !== restricted.length) throw new Error('restricted lists distinct nodes from 1 to n-1.')
  return input
}

export function buildTrace({ n, edges, restricted }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const blocked = new Set(restricted)
  const seen = new Set([0])
  const queue = [0]
  const frames = [{ phase: 'start', activeLine: L('set blocked to the restricted'), current: null, neighbour: null, visited: [0], frontier: [0], message: 'Start at node 0. Restricted nodes are never entered.' }]
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]
    frames.push({ phase: 'visit', activeLine: L('take the next node'), current, neighbour: null, visited: [...seen], frontier: queue.slice(head + 1), message: `Explore node ${current}.` })
    for (const neighbour of adj[current]) {
      if (blocked.has(neighbour) || seen.has(neighbour)) {
        frames.push({ phase: 'skip', activeLine: L('skip it'), current, neighbour, visited: [...seen], frontier: queue.slice(head + 1), message: `Node ${neighbour} is ${blocked.has(neighbour) ? 'restricted' : 'already seen'}, so skip it.` })
        continue
      }
      seen.add(neighbour)
      queue.push(neighbour)
      frames.push({ phase: 'reach', activeLine: L('mark neighbour as seen'), current, neighbour, visited: [...seen], frontier: queue.slice(head + 1), message: `Node ${neighbour} is reachable.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the number of seen'), current: null, neighbour: null, visited: [...seen], frontier: [], message: `${seen.size} node(s) are reachable from node 0.` })
  return { input: { n, edges, restricted }, result: seen.size, frames }
}

export const code = `count nodes reachable from node 0 without restricted nodes:
  set blocked to the restricted nodes
  set seen to hold node 0 and set the queue to hold node 0
  while the queue is not empty
    take the next node from the queue as current
    for each neighbour of current
      if neighbour is blocked or already seen then skip it
      otherwise mark neighbour as seen and add it to the queue
  return the number of seen nodes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def reachable_nodes(n, edges, restricted):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)
    blocked = set(restricted)
    seen = {0}
    queue = [0]
    for current in queue:
        for neighbour in adj[current]:
            if neighbour in blocked or neighbour in seen:
                continue
            seen.add(neighbour)
            queue.append(neighbour)
    return len(seen)
`
