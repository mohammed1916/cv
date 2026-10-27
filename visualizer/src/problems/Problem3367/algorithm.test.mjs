import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every subset of edges, keep those where each node has at most k kept edges, and maximize the weight.
function oracle({ n, edges, k }) {
  let best = 0
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const degree = Array(n).fill(0)
    let total = 0
    edges.forEach(([a, b, w], i) => {
      if (!(mask & (1 << i))) return
      degree[a]++
      degree[b]++
      total += w
    })
    if (degree.every(d => d <= k)) best = Math.max(best, total)
  }
  return best
}

test('3367 a path with one and two edges per node', () => {
  assert.equal(solve({ n: 3, edges: [[0, 1, 5], [1, 2, 3]], k: 1 }), 5)
  assert.equal(solve({ n: 3, edges: [[0, 1, 5], [1, 2, 3]], k: 2 }), 8)
})

test('3367 a star keeps only k of its edges', () => {
  assert.equal(solve({ n: 4, edges: [[0, 1, 4], [0, 2, 9], [0, 3, 6]], k: 2 }), 15)
})

test('3367 rejects a weight of zero', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,0]],"k":1}'))
})

test('3367 random trees match an edge-subset oracle', () => {
  let seed = 3367
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(8)
    const edges = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      const w = 1 + rnd(50)
      edges.push(rnd(2) ? [parent, i, w] : [i, parent, w])
    }
    const k = 1 + rnd(4)
    const input = { n, edges, k }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
