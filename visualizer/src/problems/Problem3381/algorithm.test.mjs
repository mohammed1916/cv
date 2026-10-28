import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3381 official examples', () => {
  assert.equal(solve([1, 2], 1), 3)
  assert.equal(solve([-1, -2, -3, -4, -5], 4), -10)
  assert.equal(solve([-5, 1, 2, -3, 4], 2), 4)
})

test('3381 k equal to the length uses the whole array only', () => {
  assert.equal(solve([3, -1, 5], 3), 7)
})

test('3381 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: try every subarray and keep the best whose length is a multiple of k.
function oracle(nums, k) {
  let best = null
  for (let l = 0; l < nums.length; l++) {
    let sum = 0
    for (let r = l; r < nums.length; r++) {
      sum += nums[r]
      if ((r - l + 1) % k === 0 && (best === null || sum > best)) best = sum
    }
  }
  return best
}

test('3381 seeded random arrays match an all-subarrays oracle', () => {
  let seed = 3381
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(21) - 10)
    const k = 1 + rnd(nums.length)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
