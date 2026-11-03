import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = points => buildTrace({ points }).result

// Independent oracle: try every two-group split and take the smallest intra-group distance.
function oracle(points) {
  const n = points.length
  const dist = (i, j) => Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1])
  let best = -Infinity
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    let factor = Infinity
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const same = ((mask >> i) & 1) === ((mask >> j) & 1)
      if (same) factor = Math.min(factor, dist(i, j))
    }
    if (factor === Infinity) factor = 0
    best = Math.max(best, factor)
  }
  return best
}

test('3710 worked examples', () => {
  assert.equal(solve([[0, 0], [3, 1], [1, 4], [4, 4]]), 5)
  assert.equal(solve([[1, 1], [1, 4], [7, 2]]), 8)
})

test('3710 two points give factor 0', () => {
  assert.equal(solve([[5, 5], [9, -3]]), 0)
})

test('3710 random small point sets match an exhaustive split oracle', () => {
  let seed = 3710
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(5)
    const points = Array.from({ length: n }, () => [rnd(13) - 6, rnd(13) - 6])
    assert.equal(solve(points), oracle(points), JSON.stringify(points))
  }
})

test('3710 rejects malformed points', () => {
  assert.throws(() => parseInput('{"points":[[0,0]]}'))
  assert.throws(() => parseInput('{"points":[[0,0,1],[1,1]]}'))
  assert.throws(() => parseInput('{"points":[[0,0.5],[1,1]]}'))
})
