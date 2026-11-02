import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2495 worked examples', () => {
  assert.equal(solve([9, 6, 7, 13]), 6)
  assert.equal(solve([1, 3, 5]), 0)
  assert.equal(solve([2, 1, 1]), 3)
})

test('2495 a single even value gives one subarray', () => {
  assert.equal(solve([4]), 1)
  assert.equal(solve([7]), 0)
})

test('2495 rejects out-of-range values', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[21]'))
})

// Oracle: test every subarray's actual product for evenness.
function oracle(nums) {
  let count = 0
  for (let a = 0; a < nums.length; a++) {
    let product = 1
    for (let b = a; b < nums.length; b++) {
      product *= nums[b]
      if (product % 2 === 0) count++
    }
  }
  return count
}

test('2495 random arrays match an explicit product oracle', () => {
  let seed = 2495
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(20))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
