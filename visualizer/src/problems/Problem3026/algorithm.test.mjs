import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3026 examples with a good subarray and with none', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6], 1), 11)
  assert.equal(solve([-1, 3, 2, 4, 5], 3), 11)
  assert.equal(solve([-1, -2, -3, -4], 2), -6)
})

test('3026 no good subarray gives zero', () => {
  assert.equal(solve([5, 5, 5], 2), 0)
})

test('3026 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: test every subarray's endpoints directly.
function oracle(nums, k) {
  let best = null
  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      if (Math.abs(nums[i] - nums[j]) === k && (best === null || sum > best)) best = sum
    }
  }
  return best === null ? 0 : best
}

test('3026 seeded random arrays match an all-subarrays oracle', () => {
  let seed = 3026
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(11) }, () => rnd(21) - 10)
    const k = 1 + rnd(10)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
