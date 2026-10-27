import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('3650 examples', () => {
  // 0 to 2 to 3 costs 1 + 4 = 5; 0 to 1 then the reversed arc 1 to 3 costs 3 + 2 = 5.
  assert.equal(solve(4, [[0, 1, 3], [3, 1, 1], [2, 3, 4], [0, 2, 1]]), 5)
  assert.equal(solve(4, [[0, 2, 1], [2, 1, 1], [1, 3, 1], [2, 3, 3]]), 3)
})

test('3650 a reversed edge costs twice its weight', () => {
  // Only the arc 1 to 0 exists in reverse; reversing 0 to 1 (weight 2) costs 4 and is the only way to reach node 1.
  assert.equal(solve(2, [[1, 0, 2]]), 4)
})

test('3650 no route, even with reversals, gives -1', () => {
  assert.equal(solve(3, [[0, 1, 1]]), -1)
})

// Independent oracle: enumerate every simple path from 0 to n-1 over the forward and reversed arcs.
function oracle(n, edges) {
  const arcs = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { arcs[u].push([v, w]); arcs[v].push([u, 2 * w]) }
  let best = Infinity
  const walk = (u, cost, seen) => {
    if (u === n - 1) { best = Math.min(best, cost); return }
    for (const [v, c] of arcs[u]) if (!seen.has(v)) { seen.add(v); walk(v, cost + c, seen); seen.delete(v) }
  }
  walk(0, 0, new Set([0]))
  return best === Infinity ? -1 : best
}

test('3650 random graphs match a simple-path enumeration oracle', () => {
  let seed = 3650
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 250; t++) {
    const n = 2 + rnd(5)
    const edges = Array.from({ length: 1 + rnd(8) }, () => { const u = rnd(n); let v = rnd(n); if (v === u) v = (u + 1) % n; return [u, v, 1 + rnd(6)] })
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
