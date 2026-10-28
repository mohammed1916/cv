import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2815 official examples', () => {
  assert.equal(solve([51, 71, 17, 24, 42]), 88)
  assert.equal(solve([1, 2, 3, 4]), -1)
})

test('2815 edge cases: equal numbers pair with each other', () => {
  assert.equal(solve([9, 9]), 18)
  assert.equal(solve([5]), -1)
})

test('2815 rejects zero and values above 9999', () => {
  assert.throws(() => parseInput('[0,5]'))
  assert.throws(() => parseInput('[10000,5]'))
})

// Independent oracle: check every pair of positions and keep the largest sum with equal largest digits.
function oracle(nums) {
  const maxDigit = v => Math.max(...String(v).split('').map(Number))
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (maxDigit(nums[i]) === maxDigit(nums[j])) best = Math.max(best, nums[i] + nums[j])
    }
  }
  return best
}

test('2815 random arrays match an all-pairs oracle', () => {
  let seed = 2815
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(999))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
