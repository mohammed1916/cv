import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3543 official examples', () => {
  assert.equal(solve({ n: 3, edges: [[0, 1, 1], [1, 2, 2]], k: 2, t: 4 }), 3)
  assert.equal(solve({ n: 3, edges: [[0, 1, 2], [0, 2, 3]], k: 1, t: 3 }), 2)
  assert.equal(solve({ n: 3, edges: [[0, 1, 6], [1, 2, 8]], k: 1, t: 6 }), -1)
})

test('3543 the limit t is strict', () => {
  assert.equal(solve({ n: 2, edges: [[0, 1, 4]], k: 1, t: 4 }), -1)
  assert.equal(solve({ n: 2, edges: [[0, 1, 4]], k: 1, t: 5 }), 4)
})

test('3543 rejects a cycle', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,1],[1,0,1]],"k":1,"t":5}'), /acyclic/)
})

// Independent oracle: enumerate every walk with k edges from every start (a DAG has no repeated node) and keep the best total below t.
function oracle({ n, edges, k, t }) {
  const out = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) out[u].push([v, w])
  let best = -1
  const walk = (v, left, sum) => {
    if (left === 0) {
      if (sum < t && sum > best) best = sum
      return
    }
    for (const [x, w] of out[v]) walk(x, left - 1, sum + w)
  }
  for (let v = 0; v < n; v++) walk(v, k, 0)
  return best
}

test('3543 random DAGs match an enumerate-every-walk oracle', () => {
  let seed = 3543
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + rnd(7)
    const edges = []
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (rnd(3) === 0 && edges.length < 12) edges.push([u, v, 1 + rnd(5)])
    const input = { n, edges, k: rnd(5), t: 1 + rnd(30) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
