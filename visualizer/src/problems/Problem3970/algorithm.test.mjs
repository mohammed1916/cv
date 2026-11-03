import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (labels, k, edges) => buildTrace({ labels, k, edges }).result

// Independent oracle: Bellman-Ford over the same (node, run) states, relaxing until nothing changes.
function oracle(labels, k, edges) {
  const n = labels.length
  const dist = Array.from({ length: n }, () => Array(k + 1).fill(Infinity))
  dist[0][1] = 0
  let changed = true
  while (changed) {
    changed = false
    for (const [u, v, w] of edges) for (let r = 1; r <= k; r++) {
      if (dist[u][r] === Infinity) continue
      const nxt = labels[v] === labels[u] ? r + 1 : 1
      if (nxt <= k && dist[u][r] + w < dist[v][nxt]) { dist[v][nxt] = dist[u][r] + w; changed = true }
    }
  }
  const best = Math.min(...dist[n - 1].slice(1))
  return best === Infinity ? -1 : best
}

test('3970 authored presets', () => {
  assert.equal(solve('abbab', 2, [[0, 1, 2], [1, 2, 3], [2, 4, 1], [0, 3, 5], [3, 4, 1]]), 6)
  assert.equal(solve('aaab', 3, [[0, 1, 1], [1, 2, 1], [2, 3, 1]]), 3)
})

test('3970 a single vertex costs nothing', () => {
  assert.equal(solve('z', 1, []), 0)
})

test('3970 a run longer than k blocks the path', () => {
  assert.equal(solve('aaaa', 3, [[0, 1, 1], [1, 2, 1], [2, 3, 1]]), -1)
})

test('3970 rejects bad input', () => {
  assert.throws(() => parseInput('{"labels":"ab","k":0,"edges":[]}'))
  assert.throws(() => parseInput('{"labels":"ab","k":1,"edges":[[0,0,1]]}'))
  assert.throws(() => parseInput('{"labels":"ab","k":1,"edges":[[0,1,0]]}'))
})

test('3970 random graphs match the Bellman-Ford oracle', () => {
  let seed = 3970
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(6)
    const labels = Array.from({ length: n }, () => 'ab'[rnd(2)]).join('')
    const k = 1 + rnd(3)
    const edges = []
    for (let e = 0; e < rnd(10); e++) {
      const u = rnd(n), v = rnd(n)
      if (u !== v) edges.push([u, v, 1 + rnd(9)])
    }
    assert.equal(solve(labels, k, edges), oracle(labels, k, edges), JSON.stringify({ labels, k, edges }))
  }
})
