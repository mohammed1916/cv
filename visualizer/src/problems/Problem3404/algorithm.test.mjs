import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3404 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 3, 6, 1]), 1)
  assert.equal(solve([3, 4, 3, 4, 3, 4, 3, 4]), 3)
})

test('3404 too short an array has no special subsequence', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6]), 0)
})

test('3404 rejects values outside 1 to 9', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[10]'))
})

// Independent oracle: check every quadruple of indices with the gap rules and the cross-product equality directly.
function oracle(nums) {
  const n = nums.length
  let count = 0
  for (let p = 0; p < n; p++) for (let q = p + 2; q < n; q++) for (let r = q + 2; r < n; r++) for (let s = r + 2; s < n; s++) {
    if (nums[p] * nums[r] === nums[q] * nums[s]) count++
  }
  return count
}

test('3404 random arrays match a direct quadruple oracle', () => {
  let seed = 3404
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 7 + rnd(8) }, () => 1 + rnd(4))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
