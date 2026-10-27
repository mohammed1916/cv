import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace({ n, edges, queries }).result

test('3553 worked examples', () => {
  // Path 0-1 (2) and 1-2 (3): the whole path of weight 5 joins 0, 1 and 2.
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 3]], [[0, 2, 1]]), [5])
  // Star at 0 with leaves 1, 2, 3 weighted 1, 2, 4: joining the three leaves costs 1 + 2 + 4.
  assert.deepEqual(solve(4, [[0, 1, 1], [0, 2, 2], [0, 3, 4]], [[1, 2, 3]]), [7])
  // Three nodes on one path cost the length of the path between the outer two.
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 3]], [[0, 0, 2]]), [5])
})

test('3553 a query with repeated nodes costs the distance between the distinct ones', () => {
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 3]], [[1, 1, 2]]), [3])
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 3]], [[2, 2, 2]]), [0])
})

test('3553 rejects a cycle and a weight outside 1 to 9', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,1],[1,0,1]],"queries":[[0,1,2]]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,10]],"queries":[[0,1,0]]}'))
})

// Independent oracle: try every subset of tree edges and keep the cheapest one that joins the three nodes.
function oracle(n, edges, [a, b, c]) {
  let best = Infinity
  const m = edges.length
  for (let mask = 0; mask < 1 << m; mask++) {
    const parent = Array.from({ length: n }, (_, i) => i)
    const find = x => (parent[x] === x ? x : find(parent[x]))
    let weight = 0
    for (let e = 0; e < m; e++) {
      if (mask & (1 << e)) {
        const [u, v, w] = edges[e]
        parent[find(u)] = find(v)
        weight += w
      }
    }
    if (find(a) === find(b) && find(b) === find(c)) best = Math.min(best, weight)
  }
  return best
}

test('3553 random trees match an edge-subset oracle', () => {
  let seed = 3553
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(6)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([i, rnd(i), 1 + rnd(9)])
    const queries = Array.from({ length: 1 + rnd(3) }, () => [rnd(n), rnd(n), rnd(n)])
    const expected = queries.map(q => oracle(n, edges, q))
    assert.deepEqual(solve(n, edges, queries), expected, JSON.stringify({ n, edges, queries }))
  }
})
