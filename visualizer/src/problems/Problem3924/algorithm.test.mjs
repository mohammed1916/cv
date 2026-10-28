import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, source, target, k) => buildTrace(parseInput(JSON.stringify({ n, edges, source, target, k }))).result

test('3924 official examples', () => {
  assert.equal(solve(6, [[0, 1, 5], [1, 2, 3], [3, 4, 4], [4, 5, 1], [1, 4, 2]], 0, 3, 1), 4)
  assert.equal(solve(6, [[0, 1, 3], [1, 2, 4], [3, 4, 5], [4, 5, 6]], 0, 4, 1), -1)
  assert.equal(solve(4, [[0, 1, 2], [1, 2, 2], [2, 3, 2], [3, 0, 2]], 0, 0, 0), 0)
})

test('3924 a single edge with k = 0 needs the edge to be light', () => {
  assert.equal(solve(2, [[0, 1, 4]], 0, 1, 0), 4)
  assert.equal(solve(2, [[0, 1, 4]], 0, 1, 1), 0)
})

test('3924 rejects a bad edge', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,5,1]],"source":0,"target":1,"k":0}'), /node labels/)
})

// Independent oracle: for each integer threshold from 0 upward, find the fewest heavy edges by
// relaxing every edge in a Bellman-Ford pass over the nodes, rather than a 0-1 search.
function oracle(n, edges, source, target, k) {
  const maxW = Math.max(0, ...edges.map(e => e[2]))
  for (let t = 0; t <= maxW; t++) {
    const dist = Array(n).fill(Infinity)
    dist[source] = 0
    for (let pass = 0; pass < n; pass++) {
      for (const [u, v, w] of edges) {
        const c = w > t ? 1 : 0
        if (dist[u] + c < dist[v]) dist[v] = dist[u] + c
        if (dist[v] + c < dist[u]) dist[u] = dist[v] + c
      }
    }
    if (dist[target] <= k) return t
  }
  return -1
}

test('3924 random graphs match a Bellman-Ford threshold oracle', () => {
  let seed = 3924
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const edges = []
    const m = rnd(9)
    for (let i = 0; i < m; i++) edges.push([rnd(n), rnd(n), 1 + rnd(6)])
    const source = rnd(n)
    const target = rnd(n)
    const k = rnd(edges.length + 1)
    assert.equal(solve(n, edges, source, target, k), oracle(n, edges, source, target, k), JSON.stringify({ n, edges, source, target, k }))
  }
})
