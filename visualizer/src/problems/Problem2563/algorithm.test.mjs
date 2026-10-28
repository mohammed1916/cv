import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, lower, upper) => buildTrace({ nums, lower, upper }).result

test('2563 official examples', () => {
  assert.equal(solve([0, 1, 7, 4, 4, 5], 3, 6), 6)
  assert.equal(solve([1, 7, 9, 2, 5], 11, 11), 1)
})

test('2563 equal values pair with each other', () => {
  assert.equal(solve([2, 2], 4, 4), 1)
})

test('2563 rejects lower above upper', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"lower":5,"upper":3}'), /lower at most upper/)
})

// Independent oracle: test every pair of original indices directly.
function oracle(nums, lower, upper) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const sum = nums[i] + nums[j]
      if (sum >= lower && sum <= upper) count++
    }
  }
  return count
}

test('2563 random inputs match a pairwise oracle', () => {
  let seed = 2563
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(41) - 20)
    const a = rnd(81) - 40
    const b = rnd(81) - 40
    const lower = Math.min(a, b)
    const upper = Math.max(a, b)
    assert.equal(solve(nums, lower, upper), oracle(nums, lower, upper), JSON.stringify({ nums, lower, upper }))
  }
})
