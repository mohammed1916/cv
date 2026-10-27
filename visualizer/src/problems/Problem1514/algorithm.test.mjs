import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, start, end) => buildTrace(parseInput(JSON.stringify({ n, edges, start, end }))).result

test('1514 examples', () => {
  // 0.5 * 0.5 = 0.25 beats the direct edge 0.2.
  assert.ok(Math.abs(solve(3, [[0, 1, 0.5], [1, 2, 0.5], [0, 2, 0.2]], 0, 2) - 0.25) < 1e-12)
  // With the direct edge at 0.3 it wins over 0.25.
  assert.ok(Math.abs(solve(3, [[0, 1, 0.5], [1, 2, 0.5], [0, 2, 0.3]], 0, 2) - 0.3) < 1e-12)
  assert.equal(solve(3, [[0, 1, 0.5]], 0, 2), 0)
})

test('1514 a longer chain beats a short weak edge', () => {
  assert.ok(Math.abs(solve(4, [[0, 1, 0.9], [1, 3, 0.9], [0, 3, 0.5]], 0, 3) - 0.81) < 1e-12)
})

test('1514 rejects a probability above one', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,1.5]],"start":0,"end":1}'))
})

// Independent oracle: relax every edge repeatedly (Bellman-Ford style) until no probability improves.
function oracle(n, edges, start, end) {
  const best = new Array(n).fill(0)
  best[start] = 1
  let changed = true
  while (changed) {
    changed = false
    for (const [a, b, q] of edges) for (const [u, v] of [[a, b], [b, a]]) {
      if (best[u] * q > best[v]) { best[v] = best[u] * q; changed = true }
    }
  }
  return best[end]
}

test('1514 random graphs match a relaxation oracle', () => {
  let seed = 1514
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 250; t++) {
    const n = 2 + rnd(5)
    const edges = []
    const pairs = new Set()
    for (let e = 0; e < 1 + rnd(8); e++) {
      const a = rnd(n), b = rnd(n)
      if (a === b) continue
      const key = a < b ? `${a},${b}` : `${b},${a}`
      if (pairs.has(key)) continue
      pairs.add(key)
      edges.push([a, b, rnd(11) / 10])
    }
    const start = rnd(n), end = rnd(n)
    const got = solve(n, edges, start, end)
    const want = oracle(n, edges, start, end)
    assert.ok(Math.abs(got - want) < 1e-12, JSON.stringify({ n, edges, start, end, got, want }))
  }
})
