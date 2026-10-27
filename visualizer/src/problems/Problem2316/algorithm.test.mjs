import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('2316 official examples', () => {
  assert.equal(solve(3, [[0, 1], [0, 2], [1, 2]]), 0)
  assert.equal(solve(7, [[0, 2], [0, 5], [2, 4], [1, 6], [5, 4]]), 14)
})

test('2316 edge cases', () => {
  assert.equal(solve(1, []), 0)
  assert.equal(solve(4, []), 6)
  assert.equal(solve(5, [[0, 1], [0, 1], [3, 4]]), 8)
})

test('2316 rejects self loops and out of range nodes', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3]]}'))
})

// Independent oracle: breadth-first search from every node, counting the nodes it cannot reach.
function oracle(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  let pairs = 0
  for (let s = 0; s < n; s++) {
    const seen = new Set([s])
    const queue = [s]
    for (let h = 0; h < queue.length; h++) for (const t of adj[queue[h]]) if (!seen.has(t)) { seen.add(t); queue.push(t) }
    pairs += n - seen.size
  }
  return pairs / 2
}

test('2316 random graphs match a breadth-first search oracle', () => {
  let seed = 2316
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const edges = []
    const count = rnd(10)
    for (let i = 0; i < count; i++) {
      const a = rnd(n)
      const b = rnd(n)
      if (a !== b) edges.push([a, b])
    }
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
