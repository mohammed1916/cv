// LeetCode 1971: breadth-first search from the source. The path exists exactly when the destination is reached.
const SOURCE = [
  "function validPath(n, edges, source, destination) {",
  "  const adj = Array.from({ length: n }, () => [])",
  "  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }",
  "  const visited = new Array(n).fill(false)",
  "  visited[source] = true",
  "  const queue = [source]",
  "  let head = 0",
  "  while (head < queue.length) {",
  "    const u = queue[head++]",
  "    if (u === destination) return true",
  "    for (const v of adj[u]) {",
  "      if (!visited[v]) { visited[v] = true; queue.push(v) }",
  "    }",
  "  }",
  "  return false",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def valid_path(n, edges, source, destination):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = [False] * n
    visited[source] = True
    queue = deque([source])
    while queue:
        u = queue.popleft()
        if u == destination:
            return True
        for v in adj[u]:
            if not visited[v]:
                visited[v] = True
                queue.append(v)
    return False
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'expand', label: 'Expand', description: 'Take the front of the queue and look at its neighbours.' },
  { id: 'done', label: 'Result', description: 'Whether the destination was reached.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"n":6,"edges":[[0,1],[1,2]],"source":0,"destination":2}.') }
  const { n, edges, source, destination } = input || {}
  if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error('n is an integer from 1 to 16.')
  if (!Array.isArray(edges) || edges.length > 30 || !edges.every(e => Array.isArray(e) && e.length === 2 && e.every(v => Number.isInteger(v) && v >= 0 && v < n) && e[0] !== e[1])) throw new Error('edges holds pairs of distinct vertices below n.')
  if (!Number.isInteger(source) || !Number.isInteger(destination) || source < 0 || destination < 0 || source >= n || destination >= n) throw new Error('source and destination are vertices below n.')
  return { n, edges, source, destination }
}

export function buildTrace({ n, edges, source, destination }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const visited = new Array(n).fill(false)
  visited[source] = true
  const queue = [source]
  const order = []
  const frames = []
  let found = false
  let head = 0
  while (head < queue.length) {
    const u = queue[head++]
    order.push(u)
    if (u === destination) {
      found = true
      frames.push({ phase: 'expand', activeLine: L('if (u === destination)'), pythonLine: P('if u == destination'), message: `Reached destination ${destination}.`, current: u, neighbour: null, visited: [...order], frontier: queue.slice(head), done: order.slice(0, -1) })
      break
    }
    frames.push({ phase: 'expand', activeLine: L('const u = queue[head++]'), pythonLine: P('u = queue.popleft'), message: `Dequeue ${u}; look at its neighbours.`, current: u, neighbour: null, visited: [...order], frontier: queue.slice(head), done: order.slice(0, -1) })
    for (const v of adj[u]) {
      if (!visited[v]) {
        visited[v] = true
        queue.push(v)
        frames.push({ phase: 'expand', activeLine: L('queue.push(v)'), pythonLine: P('queue.append(v)'), message: `Vertex ${v} is new: enqueue it.`, current: u, neighbour: v, visited: [...order], frontier: queue.slice(head), done: order.slice(0, -1) })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P(found ? 'return True' : 'return False'), message: found ? 'A valid path exists.' : 'The queue emptied before the destination was reached.', current: null, neighbour: null, visited: [...order], frontier: [], done: [...order], result: found })
  return { input: { n, edges, source, destination }, result: found, frames }
}
