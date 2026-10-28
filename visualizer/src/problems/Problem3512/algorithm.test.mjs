import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3512 official examples', () => {
  assert.equal(solve([3, 9, 7], 5), 4)
  assert.equal(solve([4, 1, 6], 5), 1)
})

test('3512 edge cases and validation', () => {
  assert.equal(solve([5], 5), 0)
  assert.equal(solve([1], 100), 1)
  assert.throws(() => parseInput('{"nums":[],"k":2}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: try decrement counts one at a time until the sum is divisible by k.
function oracle(nums, k) {
  const total = nums.reduce((a, b) => a + b, 0)
  for (let t = 0; t <= total; t++) {
    if ((total - t) % k === 0) return t
  }
  return total
}

test('3512 seeded random cases match a decrement-search oracle', () => {
  let seed = 3512
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(1000))
    const k = 1 + rnd(100)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
