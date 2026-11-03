import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

// Oracle: enumerate every subarray range and keep the widest, then multiply by k.
function oracle(nums, k) {
  let widest = 0
  for (let l = 0; l < nums.length; l++) {
    let lo = Infinity
    let hi = -Infinity
    for (let r = l; r < nums.length; r++) {
      lo = Math.min(lo, nums[r]); hi = Math.max(hi, nums[r])
      widest = Math.max(widest, hi - lo)
    }
  }
  return k * widest
}

test('3689 invented examples', () => {
  assert.equal(solve([4, -2, 7, 1], 3), 27)
  assert.equal(solve([5, 5], 2), 0)
})

test('3689 matches the subarray-enumeration oracle', () => {
  for (const [nums, k] of [[[1, 3, 2], 2], [[9, -4, 0, 3], 1], [[-7, 2, 2], 5]]) {
    assert.equal(solve(nums, k), oracle(nums, k))
  }
})
