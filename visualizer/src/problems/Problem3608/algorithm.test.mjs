import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3608 official examples', () => {
  assert.equal(solve({ n: 2, edges: [[0, 1, 3]], k: 2 }), 3)
  assert.equal(solve({ n: 3, edges: [[0, 1, 2], [1, 2, 4]], k: 3 }), 4)
  assert.equal(solve({ n: 3, edges: [[0, 2, 5]], k: 2 }), 0)
})

test('3608 a single component already meets k = 1', () => {
  assert.equal(solve({ n: 2, edges: [[0, 1, 7]], k: 1 }), 0)
})

test('3608 rejects a self-loop and k above n', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[1,1,3]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,3]],"k":3}'))
})

// Independent oracle: try every integer threshold t and count components with a breadth-first search.
function oracle({ n, edges, k }) {
  const maxTime = Math.max(0, ...edges.map(e => e[2]))
  for (let t = 0; t <= maxTime; t++) {
    const adj = Array.from({ length: n }, () => [])
    for (const [u, v, w] of edges) if (w > t) { adj[u].push(v); adj[v].push(u) }
    const seen = new Array(n).fill(false)
    let comps = 0
    for (let s = 0; s < n; s++) {
      if (seen[s]) continue
      comps++
      const queue = [s]
      seen[s] = true
      for (let h = 0; h < queue.length; h++) for (const y of adj[queue[h]]) if (!seen[y]) { seen[y] = true; queue.push(y) }
    }
    if (comps >= k) return t
  }
  return -1
}

test('3608 random graphs match a threshold-scan oracle', () => {
  let seed = 3608
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(6)
    const edges = []
    const seenPair = new Set()
    const m = rnd(n * 2)
    for (let i = 0; i < m; i++) {
      const u = rnd(n), v = rnd(n)
      const key = `${Math.min(u, v)}-${Math.max(u, v)}`
      if (u === v || seenPair.has(key)) continue
      seenPair.add(key)
      edges.push([u, v, 1 + rnd(9)])
    }
    const k = 1 + rnd(n)
    const input = { n, edges, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
