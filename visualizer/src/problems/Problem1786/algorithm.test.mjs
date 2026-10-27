import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('1786 examples', () => {
  assert.equal(solve(5, [[1, 2, 3], [1, 3, 3], [2, 3, 1], [1, 4, 2], [5, 2, 2], [3, 5, 1], [5, 4, 10]]), 3)
  assert.equal(solve(7, [[1, 3, 1], [4, 1, 2], [7, 3, 4], [2, 5, 3], [5, 6, 1], [6, 7, 2], [7, 5, 3], [2, 6, 4]]), 1)
})

test('1786 a disconnected last node gives zero, and a single edge gives one', () => {
  assert.equal(solve(3, [[1, 2, 1]]), 0)
  assert.equal(solve(2, [[1, 2, 5]]), 1)
})

test('1786 rejects self-loops and repeated pairs', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2,2],[2,1,3]]}'))
})

// Independent oracle: Floyd-Warshall distances, then explicit depth-first enumeration of every restricted path.
function oracle(n, edges) {
  const d = Array.from({ length: n + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === j ? 0 : Infinity)))
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [u, v, w] of edges) { d[u][v] = Math.min(d[u][v], w); d[v][u] = Math.min(d[v][u], w); adj[u].push(v); adj[v].push(u) }
  for (let k = 1; k <= n; k++) for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  let count = 0
  const walk = u => {
    if (u === n) { count++; return }
    for (const v of adj[u]) if (d[v][n] < d[u][n]) walk(v)
  }
  walk(1)
  return count
}

test('1786 random graphs match a path-enumeration oracle', () => {
  let seed = 1786
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const pairs = new Set()
    const edges = []
    for (let e = 0; e < 3 + rnd(10); e++) {
      const u = 1 + rnd(n), v = 1 + rnd(n)
      if (u === v) continue
      const key = u < v ? `${u},${v}` : `${v},${u}`
      if (pairs.has(key)) continue
      pairs.add(key)
      edges.push([u, v, 1 + rnd(6)])
    }
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
