import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (height, threshold) => buildTrace({ height, threshold }).result

test('3285 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5], 2), [3, 4])
  assert.deepEqual(solve([10, 1, 1], 10), [])
  assert.deepEqual(solve([10, 11, 1], 10), [2])
})

test('3285 index 0 is never stable', () => {
  assert.deepEqual(solve([100, 100, 100], 1), [1, 2])
})

test('3285 rejects bad input', () => {
  assert.throws(() => parseInput('{"height":[1,2],"threshold":1}'))
  assert.throws(() => parseInput('{"height":[1,2,3],"threshold":0}'))
})

// Oracle: a stable index i is one where some earlier index j = i - 1 is above the threshold, computed by filtering.
function oracle(height, threshold) {
  return height.map((_, i) => i).filter(i => i >= 1 && height[i - 1] > threshold)
}

test('3285 random inputs match a filter oracle', () => {
  let seed = 3285
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const height = Array.from({ length: 3 + rnd(10) }, () => 1 + rnd(20))
    const threshold = 1 + rnd(20)
    assert.deepEqual(solve(height, threshold), oracle(height, threshold), JSON.stringify({ height, threshold }))
  }
})
