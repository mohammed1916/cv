import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, solve } from './algorithm.js'

function treeDistances(n, edges, source) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const dist = Array(n).fill(-1)
  dist[source] = 0
  const queue = [source]
  for (let k = 0; k < queue.length; k++) for (const w of adj[queue[k]]) if (dist[w] < 0) { dist[w] = dist[queue[k]] + 1; queue.push(w) }
  return dist
}

function brute({ n, edges, x, y, z }) {
  const dx = treeDistances(n, edges, x)
  const dy = treeDistances(n, edges, y)
  const dz = treeDistances(n, edges, z)
  let count = 0
  for (let u = 0; u < n; u++) {
    const [a, b, c] = [dx[u], dy[u], dz[u]].sort((p, q) => p - q)
    if (a * a + b * b === c * c) count++
  }
  return count
}

test('3820 worked cases', () => {
  assert.equal(solve({ n: 5, edges: [[0, 1], [0, 2], [0, 3], [3, 4]], x: 1, y: 2, z: 4 }), 1)
  assert.equal(solve({ n: 5, edges: [[4, 0], [0, 1], [1, 2], [2, 3]], x: 4, y: 3, z: 2 }), 0)
})

test('3820 matches a brute force on several trees', () => {
  const trees = [
    { n: 7, edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [5, 6]] },
    { n: 8, edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
    { n: 6, edges: [[0, 5], [5, 4], [4, 3], [3, 2], [2, 1]] },
  ]
  for (const { n, edges } of trees) {
    for (const [x, y, z] of [[0, 1, 2], [3, 5, 6], [1, 4, 0]]) {
      if (x >= n || y >= n || z >= n) continue
      assert.equal(solve({ n, edges, x, y, z }), brute({ n, edges, x, y, z }))
    }
  }
})

test('3820 every frame names a Python and pseudocode line', () => {
  for (const frame of buildTrace({ n: 3, edges: [[0, 1], [1, 2]], x: 0, y: 1, z: 2 }).frames) assert.ok(frame.pythonLine > 0 && frame.activeLine > 0)
})

test('3820 rejects repeated target nodes', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,2]],"x":0,"y":0,"z":2}'))
})
