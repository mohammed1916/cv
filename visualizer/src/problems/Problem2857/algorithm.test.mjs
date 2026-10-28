import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (points, k) => buildTrace(parseInput(JSON.stringify({ points, k }))).result

test('2857 worked examples', () => {
  // Pairs at distance 1: (1,2)-(1,3) and (4,2)-(5,2).
  assert.equal(solve([[1, 2], [4, 2], [1, 3], [5, 2]], 1), 2)
  // Three identical points are three pairs at distance 0.
  assert.equal(solve([[0, 0], [0, 0], [0, 0]], 0), 3)
})

test('2857 rejects a point with three coordinates', () => {
  assert.throws(() => parseInput('{"points":[[1,2,3]],"k":1}'))
})

// Independent oracle: compare every pair of points directly with the XOR distance.
function oracle(points, k) {
  let count = 0
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (((points[i][0] ^ points[j][0]) + (points[i][1] ^ points[j][1])) === k) count++
    }
  }
  return count
}

test('2857 random point sets match a pairwise oracle', () => {
  let seed = 2857
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const spread = 1 + rnd(12)
    const points = Array.from({ length: 1 + rnd(20) }, () => [rnd(spread), rnd(spread)])
    const k = rnd(16)
    assert.equal(solve(points, k), oracle(points, k), JSON.stringify({ points, k }))
  }
})
