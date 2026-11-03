export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n and edges.')
  const { n, edges } = input
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new Error('n is an integer from 1 to 12; nodes are 0 to n - 1.')
  if (!Array.isArray(edges) || edges.length !== n - 1) throw new Error('A tree on n nodes has n - 1 edges.')
  if (!edges.every(e => Array.isArray(e) && e.length === 2 && e.every(x => Number.isInteger(x) && x >= 0 && x < n) && e[0] !== e[1])) {
    throw new Error('Each edge is a pair of different node numbers from 0 to n - 1.')
  }
  // Every node must be reachable from node 0; with n - 1 edges that makes the input a tree.
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const seen = new Set([0])
  const queue = [0]
  while (queue.length) { const u = queue.pop(); for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); queue.push(v) } }
  if (seen.size !== n) throw new Error('The edges must connect every node (a tree).')
  return { n, edges }
}

function neighbours(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  return adj
}

function distancesFrom(adj, source) {
  const dist = Array(adj.length).fill(-1)
  dist[source] = 0
  const queue = [source]
  for (let head = 0; head < queue.length; head++) {
    const u = queue[head]
    for (const v of adj[u]) if (dist[v] < 0) { dist[v] = dist[u] + 1; queue.push(v) }
  }
  return dist
}

const farthest = dist => dist.reduce((best, d, i) => (d > dist[best] ? i : best), 0)

export const code = `FUNCTION lastMarkedNodes(n, edges)
    adjacency ← neighbour list of each node, built from edges
    first ← farthest node from node 0 (breadth-first search)
    distFirst ← distances from first
    second ← farthest node from first, the other end of a longest path
    distSecond ← distances from second
    FOR each node i from 0 to n − 1
        IF distFirst[i] ≥ distSecond[i] THEN answer[i] ← first
        ELSE answer[i] ← second
    RETURN answer`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `from collections import deque


def last_marked_nodes(n, edges):
    adj = [[] for _ in range(n)]
    for a, b in edges:
        adj[a].append(b)
        adj[b].append(a)

    def distances(source):
        dist = [-1] * n
        dist[source] = 0
        queue = deque([source])
        while queue:
            u = queue.popleft()
            for v in adj[u]:
                if dist[v] < 0:
                    dist[v] = dist[u] + 1
                    queue.append(v)
        return dist

    dist0 = distances(0)
    first = max(range(n), key=lambda i: dist0[i])
    dist_first = distances(first)
    second = max(range(n), key=lambda i: dist_first[i])
    dist_second = distances(second)
    return [first if dist_first[i] >= dist_second[i] else second for i in range(n)]


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(last_marked_nodes(data["n"], data["edges"]))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ n, edges }) {
  const adj = neighbours(n, edges)
  const frames = []
  frames.push({
    phase: 'start', activeLine: L('adjacency ←'), pythonLine: P('adj = [[] for'),
    source: null, dist: null, first: null, second: null, distFirst: null, distSecond: null,
    answer: Array(n).fill(null), i: -1, message: 'Build the neighbour lists from the edges.',
  })
  const dist0 = distancesFrom(adj, 0)
  frames.push({
    phase: 'measure', activeLine: L('first ← farthest node from node 0'), pythonLine: P('dist0 = distances(0)'),
    source: 0, dist: dist0, first: null, second: null, distFirst: null, distSecond: null,
    answer: Array(n).fill(null), i: -1, message: 'Measure distances from node 0; its farthest node is an end of a longest path.',
  })
  const first = farthest(dist0)
  frames.push({
    phase: 'pick', activeLine: L('first ← farthest node from node 0'), pythonLine: P('first = max(range(n)'),
    source: 0, dist: dist0, first, second: null, distFirst: null, distSecond: null,
    answer: Array(n).fill(null), i: -1, message: `Node ${first} is the farthest from node 0, so it is the first end.`,
  })
  const distFirst = distancesFrom(adj, first)
  frames.push({
    phase: 'measure', activeLine: L('distFirst ← distances from first'), pythonLine: P('dist_first = distances(first)'),
    source: first, dist: distFirst, first, second: null, distFirst, distSecond: null,
    answer: Array(n).fill(null), i: -1, message: `Measure distances from node ${first}.`,
  })
  const second = farthest(distFirst)
  frames.push({
    phase: 'pick', activeLine: L('second ← farthest node from first'), pythonLine: P('second = max(range(n)'),
    source: first, dist: distFirst, first, second, distFirst, distSecond: null,
    answer: Array(n).fill(null), i: -1, message: `Node ${second} is the farthest from node ${first}: the two ends of a longest path.`,
  })
  const distSecond = distancesFrom(adj, second)
  frames.push({
    phase: 'measure', activeLine: L('distSecond ← distances from second'), pythonLine: P('dist_second = distances(second)'),
    source: second, dist: distSecond, first, second, distFirst, distSecond,
    answer: Array(n).fill(null), i: -1, message: `Measure distances from node ${second}.`,
  })
  const answer = []
  for (let i = 0; i < n; i++) {
    const pick = distFirst[i] >= distSecond[i] ? first : second
    answer.push(pick)
    frames.push({
      phase: 'assign', activeLine: L('IF distFirst[i]'), pythonLine: P('return [first if'),
      source: null, dist: null, first, second, distFirst, distSecond,
      answer: answer.concat(Array(n - answer.length).fill(null)), i, pick,
      message: `Node ${i}: distance ${distFirst[i]} from ${first} and ${distSecond[i]} from ${second}, so the answer is ${pick}.`,
    })
  }
  frames.push({
    phase: 'done', activeLine: L('RETURN answer'), pythonLine: P('return [first if'),
    source: null, dist: null, first, second, distFirst, distSecond, answer: answer.slice(), i: n,
    message: `Answer per starting node: [${answer.join(', ')}].`,
  })
  return { input: { n, edges }, result: answer, frames }
}
