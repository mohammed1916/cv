import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3736 worked examples', () => {
  assert.equal(solve([3, 7, 4]), 7)
  assert.equal(solve([2, 2, 8, 5]), 15)
  assert.equal(solve([7]), 0)
})

test('3736 matches a brute force over every reachable common level', () => {
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + (trial % 6)
    const nums = Array.from({ length: n }, (_, k) => 1 + ((trial * 37 + k * 11) % 100))
    const max = Math.max(...nums)
    let best = Infinity
    for (let t = max; t <= max + 30; t++) best = Math.min(best, nums.reduce((s, x) => s + (t - x), 0))
    assert.equal(solve(nums), best)
  }
})

test('3736 rejects values outside the visualized range', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[101]'))
})
