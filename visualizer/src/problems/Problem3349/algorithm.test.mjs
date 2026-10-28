import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3349 official examples', () => {
  assert.equal(solve([2, 5, 7, 8, 9, 2, 3, 4, 3, 1], 3), true)
  assert.equal(solve([1, 2, 3, 4, 4, 4, 4, 5, 6, 7], 5), false)
})

test('3349 the two runs must be neighbors', () => {
  // The increasing runs [1,2] and [3,4] are adjacent; [1,2] and [5,6] are increasing but not adjacent.
  assert.equal(solve([1, 2, 3, 4], 2), true)
  assert.equal(solve([1, 2, 3, 2, 1, 5, 6], 2), false)
})

test('3349 rejects k larger than half the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2}'), /2k/)
})

// Independent oracle: a run is strictly increasing when every adjacent difference inside it is positive.
function oracle(nums, k) {
  const rising = nums.slice(1).map((v, i) => v - nums[i] > 0)
  for (let a = 0; a + 2 * k <= nums.length; a++) {
    const first = rising.slice(a, a + k - 1).every(Boolean)
    const second = rising.slice(a + k, a + 2 * k - 1).every(Boolean)
    if (first && second) return true
  }
  return false
}

test('3349 random arrays match a difference-based oracle', () => {
  let seed = 3349
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(13) }, () => rnd(6))
    const k = 1 + rnd(Math.floor(nums.length / 2))
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
