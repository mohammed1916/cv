import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (parents, weights) => buildTrace({ parents, weights }).result

test('2378 worked examples', () => {
  assert.equal(solve([-1, 0, 0, 1, 1], [0, 5, -2, 3, 4]), 5)
  assert.equal(solve([-1, 0, 0], [0, -4, -7]), 0)
  assert.equal(solve([-1], [0]), 0)
})

test('2378 a path chooses the heavier non-adjacent edges', () => {
  // 0-1-2-3 with weights 3, 10, 4: best is edges (0,1) and (2,3) = 7 or edge (1,2) alone = 10.
  assert.equal(solve([-1, 0, 1, 2], [0, 3, 10, 4]), 10)
})

test('2378 rejects a cycle or non-root parent', () => {
  assert.throws(() => parseInput('{"parents":[-1,2,1],"weights":[0,1,1]}'))
  assert.throws(() => parseInput('{"parents":[0,0],"weights":[0,1]}'))
})

// Oracle: try every subset of edges and keep the best matching.
function oracle(parents, weights) {
  const n = parents.length
  const edges = []
  for (let v = 1; v < n; v++) edges.push([parents[v], v, weights[v]])
  let best = 0
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const used = new Set()
    let total = 0, ok = true
    edges.forEach(([a, b, w], i) => {
      if (!ok || !((mask >> i) & 1)) return
      if (used.has(a) || used.has(b)) ok = false
      used.add(a); used.add(b)
      total += w
    })
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('2378 random trees match an edge-subset oracle', () => {
  let seed = 2378
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const parents = [-1, ...Array.from({ length: n - 1 }, (_, i) => rnd(i + 1))]
    const weights = [0, ...Array.from({ length: n - 1 }, () => rnd(41) - 20)]
    assert.equal(solve(parents, weights), oracle(parents, weights), JSON.stringify({ parents, weights }))
  }
})
