import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, disappear) => buildTrace(parseInput(JSON.stringify({ n, edges, disappear }))).result

test('3112 examples', () => {
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 2], [0, 2, 5]], [10, 3, 10]), [0, 2, 4])
  assert.deepEqual(solve(3, [[0, 1, 2], [1, 2, 2], [0, 2, 5]], [10, 2, 10]), [0, -1, 5])
})

test('3112 arriving exactly when a node disappears is too late', () => {
  assert.deepEqual(solve(2, [[0, 1, 4]], [9, 4]), [0, -1])
  assert.deepEqual(solve(2, [[0, 1, 4]], [9, 5]), [0, 4])
})

test('3112 rejects a missing disappearance time', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,1]],"disappear":[5]}'))
})

// Independent oracle: Bellman-Ford style relaxation to a fixed point, accepting an arrival only before its deadline.
function oracle(n, edges, disappear) {
  const arrive = new Array(n).fill(Infinity)
  arrive[0] = 0
  let changed = true
  while (changed) {
    changed = false
    for (const [a, b, len] of edges) for (const [u, v] of [[a, b], [b, a]]) {
      const time = arrive[u] + len
      if (arrive[u] < Infinity && time < disappear[v] && time < arrive[v]) { arrive[v] = time; changed = true }
    }
  }
  return arrive.map(a => (a === Infinity ? -1 : a))
}

test('3112 random graphs match a fixed-point oracle', () => {
  let seed = 3112
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 250; t++) {
    const n = 2 + rnd(6)
    const edges = Array.from({ length: rnd(10) }, () => { const u = rnd(n); let v = rnd(n); if (v === u) v = (u + 1) % n; return [u, v, 1 + rnd(6)] })
    const disappear = Array.from({ length: n }, () => 1 + rnd(15))
    assert.deepEqual(solve(n, edges, disappear), oracle(n, edges, disappear), JSON.stringify({ n, edges, disappear }))
  }
})
