import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3634 worked examples', () => {
  assert.equal(solve([1, 3, 6, 9], 2), 1)
  assert.equal(solve([5, 5, 5], 1), 0)
  assert.equal(solve([1, 100], 2), 1)
})

test('3634 a single value is always balanced', () => {
  assert.equal(solve([7], 1), 0)
})

test('3634 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: try every subset of a small array.
function oracle(nums, k) {
  const n = nums.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const kept = nums.filter((_, idx) => mask & (1 << idx))
    const lo = Math.min(...kept)
    const hi = Math.max(...kept)
    if (hi - lo <= k * lo) best = Math.max(best, kept.length)
  }
  return n - best
}

test('3634 agrees with the subset oracle on generated arrays', () => {
  let seed = 7
  const next = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
  for (let trial = 0; trial < 300; trial++) {
    const n = 1 + Math.floor(next() * 8)
    const nums = Array.from({ length: n }, () => 1 + Math.floor(next() * 30))
    const k = 1 + Math.floor(next() * 4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
