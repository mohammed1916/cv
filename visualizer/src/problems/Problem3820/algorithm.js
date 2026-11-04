export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.edges)) throw new Error('Use an object with n, edges, x, y and z.')
  const { n, edges, x, y, z } = input
  if (!Number.isInteger(n) || n < 3 || n > 14) throw new Error('n is an integer from 3 to 14.')
  if (edges.length !== n - 1 || !edges.every(e => Array.isArray(e) && e.length === 2 && e.every(v => Number.isInteger(v) && v >= 0 && v < n))) throw new Error('edges has n - 1 pairs of node numbers.')
  const targets = [x, y, z]
  if (!targets.every(v => Number.isInteger(v) && v >= 0 && v < n) || new Set(targets).size !== 3) throw new Error('x, y and z are three distinct nodes.')
  const seen = new Set([0])
  const stack = [0]
  while (stack.length) {
    const v = stack.pop()
    for (const [a, b] of edges) {
      if (a === v && !seen.has(b)) { seen.add(b); stack.push(b) }
      if (b === v && !seen.has(a)) { seen.add(a); stack.push(a) }
    }
  }
  if (seen.size !== n) throw new Error('edges must connect every node into one tree.')
  return { n, edges, x, y, z }
}

function distancesFrom(n, adj, source) {
  const dist = Array(n).fill(-1)
  dist[source] = 0
  const queue = [source]
  for (let k = 0; k < queue.length; k++) {
    const v = queue[k]
    for (const w of adj[v]) if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w) }
  }
  return dist
}

export function buildTrace({ n, edges, x, y, z }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const dx = distancesFrom(n, adj, x)
  const dy = distancesFrom(n, adj, y)
  const dz = distancesFrom(n, adj, z)
  const frames = [{ pythonLine: P('dx, dy, dz ='), phase: 'distances', activeLine: C('compute the distance'), at: -1, dist: null, special: null, count: 0,
    table: [], message: 'Distances from x, y and z are known for every node.' }]
  let count = 0
  const table = []
  for (let u = 0; u < n; u++) {
    const sorted = [dx[u], dy[u], dz[u]].sort((a, b) => a - b)
    const special = sorted[0] * sorted[0] + sorted[1] * sorted[1] === sorted[2] * sorted[2]
    if (special) count++
    table.push({ u, distances: [dx[u], dy[u], dz[u]], special })
    frames.push({ pythonLine: P('a, b, c = sorted'), phase: 'check', activeLine: C('sort the three'), at: u, dist: sorted, special, count, table: [...table],
      message: `Node ${u}: sorted distances ${sorted.join(', ')} ${special ? 'form' : 'do not form'} a Pythagorean triple.` })
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: C('return the count'), at: -1, dist: null, special: null, count, table, message: `${count} special node${count === 1 ? '' : 's'}.` })
  return { input: { n, edges, x, y, z }, result: count, frames }
}

export function solve(input) {
  return buildTrace(input).result
}

export const code = `function pythagoreanNodes(n, edges, x, y, z) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  // compute the distance from every node to a source by breadth-first search
  const distances = source => {
    const dist = Array(n).fill(-1)
    dist[source] = 0
    const queue = [source]
    for (let k = 0; k < queue.length; k++) {
      const v = queue[k]
      for (const w of adj[v]) if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w) }
    }
    return dist
  }
  const dx = distances(x), dy = distances(y), dz = distances(z)
  let count = 0
  for (let u = 0; u < n; u++) {
    // sort the three distances, then test the two smaller squares against the largest
    const [a, b, c] = [dx[u], dy[u], dz[u]].sort((p, q) => p - q)
    if (a * a + b * b === c * c) count++
  }
  // return the count
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def pythagorean_nodes(n, edges, x, y, z):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def distances(source):
        dist = [-1] * n
        dist[source] = 0
        queue = deque([source])
        while queue:
            v = queue.popleft()
            for w in adj[v]:
                if dist[w] < 0:
                    dist[w] = dist[v] + 1
                    queue.append(w)
        return dist

    dx, dy, dz = distances(x), distances(y), distances(z)
    count = 0
    for u in range(n):
        a, b, c = sorted((dx[u], dy[u], dz[u]))
        if a * a + b * b == c * c:
            count += 1
    return count
`

const PY = python.split('\n')
const CODE = code.map(c => c.text)
function P(text) { return PY.findIndex(line => line.includes(text)) + 1 }
function C(text) { return CODE.findIndex(line => line.includes(text)) + 1 }
