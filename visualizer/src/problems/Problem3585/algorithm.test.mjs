import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace(parseInput(JSON.stringify({ n, edges, queries }))).result

test('3585 official examples', () => {
  assert.deepEqual(solve(2, [[0, 1, 7]], [[1, 0], [0, 1]]), [0, 1])
  assert.deepEqual(solve(3, [[0, 1, 2], [2, 0, 4]], [[0, 1], [2, 0], [1, 2]]), [1, 0, 2])
  assert.deepEqual(solve(5, [[0, 1, 2], [0, 2, 5], [1, 3, 1], [2, 4, 3]], [[3, 4], [1, 2]]), [2, 2])
})

test('3585 a query from a node to itself returns that node', () => {
  assert.deepEqual(solve(2, [[0, 1, 3]], [[1, 1]]), [1])
})

test('3585 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,1],[0,1,1]],"queries":[[0,1]]}'))
})

// Independent oracle: find each path by a depth-first search over the tree, then scan it for the first node that reaches half.
function oracle(n, edges, queries) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, w] of edges) { adj[a].push([b, w]); adj[b].push([a, w]) }
  const findPath = (from, to) => {
    const walk = (v, parent, trail) => {
      if (v === to) return trail
      for (const [w, c] of adj[v]) {
        if (w === parent) continue
        const found = walk(w, v, [...trail, [w, c]])
        if (found) return found
      }
      return null
    }
    return walk(from, -1, [[from, 0]])
  }
  return queries.map(([u, v]) => {
    const steps = findPath(u, v)
    const total = steps.reduce((s, [, c]) => s + c, 0)
    let cum = 0
    for (let i = 0; i < steps.length; i++) {
      cum += steps[i][1]
      if (2 * cum >= total) return steps[i][0]
    }
    return u
  })
}

test('3585 random trees match a depth-first oracle', () => {
  let seed = 3585
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i, 1 + rnd(9)])
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(n), rnd(n)])
    assert.deepEqual(solve(n, edges, queries), oracle(n, edges, queries), JSON.stringify({ n, edges, queries }))
  }
})
