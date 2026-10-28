import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace(parseInput(JSON.stringify({ n, edges, queries }))).result

test('3559 official examples', () => {
  assert.deepEqual(solve(2, [[1, 2]], [[1, 1], [1, 2]]), [0, 1])
  assert.deepEqual(solve(5, [[1, 2], [1, 3], [3, 4], [3, 5]], [[1, 4], [3, 4], [2, 5]]), [2, 1, 4])
})

test('3559 a long path uses powers of two', () => {
  assert.deepEqual(solve(5, [[1, 2], [2, 3], [3, 4], [4, 5]], [[1, 5]]), [8])
})

test('3559 rejects a disconnected edge list', () => {
  assert.throws(() => parseInput('{"n":4,"edges":[[1,2],[1,2],[3,4]],"queries":[[1,2]]}'))
})

// Independent oracle: find the path by a depth-first search, then try all 2^L weight choices and count the odd totals.
function oracle(n, edges, queries) {
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const pathEdges = (from, to) => {
    const walk = (v, parent, trail) => {
      if (v === to) return trail
      for (const w of adj[v]) if (w !== parent) {
        const found = walk(w, v, [...trail, 1])
        if (found) return found
      }
      return null
    }
    return walk(from, -1, [])
  }
  return queries.map(([u, v]) => {
    const L = (pathEdges(u, v) || []).length
    let count = 0
    for (let mask = 0; mask < 1 << L; mask++) {
      let sum = 0
      for (let i = 0; i < L; i++) sum += (mask >> i) & 1 ? 1 : 2
      if (sum % 2 === 1) count++
    }
    return count % 1000000007
  })
}

test('3559 random trees match an enumerate-all-weights oracle', () => {
  let seed = 3559
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let i = 2; i <= n; i++) edges.push([1 + rnd(i - 1), i])
    const queries = Array.from({ length: 1 + rnd(4) }, () => [1 + rnd(n), 1 + rnd(n)])
    assert.deepEqual(solve(n, edges, queries), oracle(n, edges, queries), JSON.stringify({ n, edges, queries }))
  }
})
