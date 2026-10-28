import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, good) => buildTrace({ n, edges, good }).result

test('3772 official examples', () => {
  assert.deepEqual(solve(3, [[0, 1], [1, 2]], [1, 0, 1]), [1, 1, 1])
  assert.deepEqual(solve(5, [[1, 0], [1, 2], [1, 3], [3, 4]], [0, 1, 0, 1, 1]), [2, 3, 2, 3, 3])
  assert.deepEqual(solve(2, [[0, 1]], [0, 0]), [-1, -1])
})

test('3772 edge case: one good node in a path of bad nodes', () => {
  assert.deepEqual(solve(3, [[0, 1], [1, 2]], [0, 1, 0]), [0, 1, 0])
})

test('3772 rejects a graph that is not connected', () => {
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[0,1],[2,3]],"good":[1,1,1,1]}'))
})

// Independent oracle: enumerate every non-empty subset of nodes, keep only connected ones, and record the best score for each member.
function oracle(n, edges, good) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const best = Array(n).fill(-Infinity)
  for (let mask = 1; mask < 1 << n; mask++) {
    const members = []
    for (let i = 0; i < n; i++) if (mask >> i & 1) members.push(i)
    const seen = new Set([members[0]])
    const queue = [members[0]]
    for (let h = 0; h < queue.length; h++) {
      for (const y of adj[queue[h]]) if ((mask >> y & 1) && !seen.has(y)) { seen.add(y); queue.push(y) }
    }
    if (seen.size !== members.length) continue
    let score = 0
    for (const v of members) score += good[v] ? 1 : -1
    for (const v of members) best[v] = Math.max(best[v], score)
  }
  return best
}

test('3772 random trees match a subset-enumeration oracle', () => {
  let seed = 3772
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(7) + 2
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v])
    const good = Array.from({ length: n }, () => rnd(2))
    assert.deepEqual(solve(n, edges, good), oracle(n, edges, good), JSON.stringify({ n, edges, good }))
  }
})
