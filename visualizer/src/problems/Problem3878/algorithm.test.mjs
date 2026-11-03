import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: enumerate every subarray by start and end index and test membership directly.
function oracle(nums) {
  let total = 0
  for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
    let or = 0
    for (let k = i; k <= j; k++) or |= nums[k]
    if (nums.slice(i, j + 1).some(v => v === or)) total++
  }
  return total
}

test('3878 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums":[4,2,3]}')).result, 4)
  assert.equal(buildTrace(parseInput('{"nums":[1,3,1]}')).result, 6)
})

test('3878 matches the direct oracle on random arrays', () => {
  for (let trial = 0; trial < 200; trial++) {
    const nums = Array.from({ length: 1 + (trial % 9) }, () => Math.floor(Math.random() * 8))
    assert.equal(buildTrace({ nums }).result, oracle(nums), JSON.stringify(nums))
  }
})
