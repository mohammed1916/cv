import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('3123 examples', () => {
  assert.deepEqual(solve(6, [[0, 1, 4], [0, 2, 1], [1, 3, 2], [1, 4, 3], [1, 5, 1], [2, 3, 1], [3, 5, 3], [4, 5, 2]]), [true, true, true, false, true, true, true, false])
  // The path 0-2-3-1-5 (cost 5) uses edge 1-3 in reverse, so that edge is on a shortest path too.
  // Shortest total 2 goes 0-2-3; the route 0-1-3 costs 6.
  assert.deepEqual(solve(4, [[2, 0, 1], [0, 1, 1], [1, 3, 5], [2, 3, 1]]), [true, false, false, true])
})

test('3123 an unreachable last node marks every edge false', () => {
  assert.deepEqual(solve(3, [[0, 1, 2]]), [false])
})

test('3123 rejects a self-loop and an out-of-range node', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3,2]]}'))
})

// Independent oracle: Floyd-Warshall all-pairs distances, then the same edge test on those distances.
function oracle(n, edges) {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [a, b, w] of edges) { d[a][b] = Math.min(d[a][b], w); d[b][a] = Math.min(d[b][a], w) }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  const total = d[0][n - 1]
  return edges.map(([a, b, w]) => total < Infinity && (d[0][a] + w + d[b][n - 1] === total || d[0][b] + w + d[a][n - 1] === total))
}

test('3123 random graphs match a Floyd-Warshall oracle', () => {
  let seed = 3123
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 250; t++) {
    const n = 2 + rnd(5)
    const edges = []
    const pairs = new Set()
    for (let e = 0; e < 1 + rnd(9); e++) {
      const a = rnd(n), b = rnd(n)
      if (a === b) continue
      const key = a < b ? `${a},${b}` : `${b},${a}`
      if (pairs.has(key)) continue
      pairs.add(key)
      edges.push([a, b, 1 + rnd(6)])
    }
    if (edges.length === 0) edges.push([0, 1, 1])
    assert.deepEqual(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
