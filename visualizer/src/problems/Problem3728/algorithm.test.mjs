import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3728 official examples', () => {
  assert.equal(solve([9, 3, 3, 3, 9]), 2)
  assert.equal(solve([1, 2, 3, 4, 5]), 0)
  assert.equal(solve([-4, 4, 0, 0, -8, -4]), 1)
})

test('3728 length below 3 is rejected', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
})

// Independent oracle: check every subarray of length at least 3 by summing its interior directly.
function oracle(nums) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l + 2; r < nums.length; r++) {
      let interior = 0
      for (let k = l + 1; k < r; k++) interior += nums[k]
      if (nums[l] === interior && nums[r] === interior) count++
    }
  }
  return count
}

let seed = 3728
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3728 seeded random against direct oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => rnd(7) - 3)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
