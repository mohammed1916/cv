import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, group) => buildTrace({ n, edges, group }).result

test('3786 official examples', () => {
  assert.equal(solve(3, [[0, 1], [1, 2]], [1, 1, 1]), 4)
  assert.equal(solve(3, [[0, 1], [1, 2]], [3, 2, 3]), 2)
  assert.equal(solve(4, [[0, 1], [0, 2], [0, 3]], [1, 1, 4, 4]), 3)
  assert.equal(solve(2, [[0, 1]], [9, 8]), 0)
})

test('3786 edge case: a single node', () => {
  assert.equal(solve(1, [], [5]), 0)
})

test('3786 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]],"group":[1,1,1]}'))
})

// Independent oracle: Floyd-Warshall all-pairs distances instead of breadth-first search from each node.
function oracle(n, edges, group) {
  const INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [u, v] of edges) { d[u][v] = 1; d[v][u] = 1 }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  let total = 0
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (group[u] === group[v]) total += d[u][v]
  return total
}

test('3786 random trees match a Floyd-Warshall oracle', () => {
  let seed = 3786
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(11) + 1
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v])
    const group = Array.from({ length: n }, () => rnd(3) + 1)
    assert.equal(solve(n, edges, group), oracle(n, edges, group), JSON.stringify({ n, edges, group }))
  }
})
