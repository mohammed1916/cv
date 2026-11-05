import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result
const brute = nums => {
  let best = -Infinity
  for (let a = 0; a < nums.length; a++) for (let b = 0; b < nums.length; b++) for (let c = 0; c < nums.length; c++) for (let d = 0; d < nums.length; d++) {
    if (new Set([a, b, c, d]).size < 4) continue
    best = Math.max(best, nums[a] * nums[b] - nums[c] * nums[d])
  }
  return best
}

test('1913 invented example and repeated values', () => {
  assert.equal(solve('[2,9,4,1,7]'), 61)
  assert.equal(solve('[3,3,8,1]'), 21)
})

test('1913 matches brute force on small arrays', () => {
  for (let trial = 0; trial < 60; trial++) {
    const size = 4 + (trial % 4)
    const nums = Array.from({ length: size }, (_, i) => 1 + ((trial * 37 + i * 91) % 30))
    assert.equal(solve(JSON.stringify(nums)), brute(nums), JSON.stringify(nums))
  }
})

test('1913 rejects arrays outside the visualization range', () => {
  assert.throws(() => parseInput('[1,2,3]'))
})
