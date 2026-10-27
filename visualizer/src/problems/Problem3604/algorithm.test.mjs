import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('3604 examples', () => {
  // 0 to 1 is open from 0 to 1: depart 0, arrive 1. 1 to 2 is open from 2 to 3: wait until 2, arrive 3.
  assert.equal(solve(3, [[0, 1, 0, 1], [1, 2, 2, 3]]), 3)
  // Leaving 0 at time 1 reaches node 1 at 2, but the edge 1 to 2 closes at time 0.
  assert.equal(solve(3, [[0, 1, 1, 1], [1, 2, 0, 0]]), -1)
})

test('3604 waiting at a node is allowed and an edge can be used exactly at its end', () => {
  assert.equal(solve(2, [[0, 1, 5, 5]]), 6)
  assert.equal(solve(2, [[0, 1, 0, 4]]), 1)
})

test('3604 rejects an edge whose window is reversed', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,4,2]]}'))
})

// Independent oracle: simulate the set of nodes you can stand on at each second.
function oracle(n, edges) {
  const horizon = Math.max(...edges.map(e => e[3])) + 2
  let reach = new Set([0])
  for (let t = 0; t <= horizon; t++) {
    if (reach.has(n - 1)) return t
    const next = new Set(reach)
    for (const [u, v, s, e] of edges) if (reach.has(u) && s <= t && t <= e) next.add(v)
    reach = next
  }
  return -1
}

test('3604 random graphs match a per-second reachability oracle', () => {
  let seed = 3604
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 250; t++) {
    const n = 2 + rnd(5)
    const edges = Array.from({ length: 1 + rnd(8) }, () => {
      const u = rnd(n); let v = rnd(n); if (v === u) v = (u + 1) % n
      const a = rnd(11), b = rnd(11)
      return [u, v, Math.min(a, b), Math.max(a, b)]
    })
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
