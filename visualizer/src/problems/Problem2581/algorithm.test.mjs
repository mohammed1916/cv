import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2581 official examples', () => {
  assert.equal(solve({ edges: [[0, 1], [1, 2], [1, 3], [4, 2]], guesses: [[1, 3], [0, 1], [1, 0], [2, 4]], k: 3 }), 3)
  assert.equal(solve({ edges: [[0, 1], [1, 2], [2, 3], [3, 4]], guesses: [[1, 0], [3, 4], [2, 1], [3, 2]], k: 1 }), 5)
})

test('2581 k of zero makes every root possible', () => {
  assert.equal(solve({ edges: [[0, 1]], guesses: [[0, 1]], k: 0 }), 2)
})

test('2581 rejects k above the number of guesses', () => {
  assert.throws(() => parseInput(JSON.stringify({ edges: [[0, 1]], guesses: [[0, 1]], k: 2 })))
})

// Independent oracle: for every candidate root, run a fresh BFS, record each vertex's parent,
// and count the guesses [u, v] where u really is v's parent. This is O(n^2) and shares no
// rerooting logic with the solution.
function oracle({ edges, guesses, k }) {
  const n = edges.length + 1
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  let roots = 0
  for (let r = 0; r < n; r++) {
    const parent = Array(n).fill(-2)
    parent[r] = -1
    const queue = [r]
    for (let q = 0; q < queue.length; q++) {
      for (const w of adj[queue[q]]) if (parent[w] === -2) { parent[w] = queue[q]; queue.push(w) }
    }
    const correct = guesses.filter(([u, v]) => parent[v] === u).length
    if (correct >= k) roots++
  }
  return roots
}

test('2581 random trees match a fresh-BFS-per-root oracle', () => {
  let seed = 2581
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(8)
    const edges = []
    for (let i = 1; i < n; i++) edges.push(rnd(2) ? [rnd(i), i] : [i, rnd(i)])
    const pairs = []
    for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v) pairs.push([u, v])
    const guesses = []
    const count = Math.min(pairs.length, 1 + rnd(6))
    while (guesses.length < count) {
      const pick = pairs[rnd(pairs.length)]
      if (!guesses.some(g => g[0] === pick[0] && g[1] === pick[1])) guesses.push(pick)
    }
    const input = { edges, guesses, k: rnd(count + 1) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
