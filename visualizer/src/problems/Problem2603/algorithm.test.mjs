import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2603 official example', () => {
  // Start at node 2: collect coin 0 from distance 2, walk to 3 to collect coin 5, and walk back.
  assert.equal(solve({ coins: [1, 0, 0, 0, 0, 1], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] }), 2)
})

test('2603 no coins and a single node need no walking', () => {
  assert.equal(solve({ coins: [0, 0, 0], edges: [[0, 1], [1, 2]] }), 0)
  assert.equal(solve({ coins: [1], edges: [] }), 0)
})

test('2603 rejects edges that do not form a tree', () => {
  assert.throws(() => parseInput('{"coins":[0,0,0],"edges":[[0,1],[0,1]]}'))
})

// Independent oracle: breadth-first search over (position, coins collected) states from every start,
// where standing on a node collects every coin within distance 2 and each move costs 1.
function oracle({ coins, edges }) {
  const n = coins.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const dist = Array.from({ length: n }, (_, s) => {
    const d = Array(n).fill(-1)
    d[s] = 0
    const q = [s]
    for (let h = 0; h < q.length; h++) for (const u of adj[q[h]]) if (d[u] < 0) { d[u] = d[q[h]] + 1; q.push(u) }
    return d
  })
  const coinMask = coins.reduce((m, c, i) => (c ? m | (1 << i) : m), 0)
  const near = Array.from({ length: n }, (_, v) => {
    let m = 0
    for (let u = 0; u < n; u++) if (coins[u] && dist[v][u] <= 2) m |= 1 << u
    return m
  })
  let best = Infinity
  for (let s = 0; s < n; s++) {
    const key = (v, m) => v * (1 << n) + m
    const seen = new Map([[key(s, near[s]), 0]])
    const q = [[s, near[s]]]
    for (let h = 0; h < q.length; h++) {
      const [v, m] = q[h]
      const d = seen.get(key(v, m))
      if (v === s && (m & coinMask) === coinMask) { best = Math.min(best, d); break }
      for (const u of adj[v]) {
        const nm = m | near[u]
        if (!seen.has(key(u, nm))) { seen.set(key(u, nm), d + 1); q.push([u, nm]) }
      }
    }
  }
  return best
}

test('2603 seeded random trees match a search oracle', () => {
  let seed = 2603
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const coins = Array.from({ length: n }, () => rnd(2))
    const edges = Array.from({ length: n - 1 }, (_, i) => [rnd(i + 1), i + 1])
    const input = { coins, edges }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
