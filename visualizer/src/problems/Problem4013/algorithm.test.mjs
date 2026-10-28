import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, a, b) => buildTrace({ nums, a, b }).result

test('4013 official examples', () => {
  assert.equal(solve([1, 2, 1, 2], 3, 2), 7)
  assert.equal(solve([2, 2, 1], 2, 1), 3)
  assert.equal(solve([2, 2, 2], 1, 1), 0)
})

test('4013 a subarray with no odd element is never valid', () => {
  assert.equal(solve([4, 6], 1000, 1), 0)
})

test('4013 rejects a zero ratio parameter', () => {
  assert.throws(() => parseInput('{"nums":[1],"a":0,"b":1}'))
})

// Independent oracle: test every subarray with exact cross-multiplication and an odd-count check.
function oracle(nums, a, b) {
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    let evens = 0
    let odds = 0
    for (let r = l; r < nums.length; r++) {
      if (nums[r] % 2 === 0) evens++
      else odds++
      if (odds > 0 && evens * b <= a * odds) count++
    }
  }
  return count
}

test('4013 random cases match an all-subarrays oracle', () => {
  let seed = 4013
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(9))
    const a = 1 + rnd(6)
    const b = 1 + rnd(6)
    assert.equal(solve(nums, a, b), oracle(nums, a, b), JSON.stringify({ nums, a, b }))
  }
})
