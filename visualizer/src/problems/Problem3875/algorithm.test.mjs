import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every keep-or-subtract choice and check that all results share a parity.
function oracle(nums) {
  const n = nums.length
  const options = i => [nums[i], ...nums.flatMap((v, j) => (j === i ? [] : [nums[i] - v]))]
  const pick = (i, parities) => {
    if (i === n) return new Set(parities).size === 1
    return options(i).some(v => pick(i + 1, [...parities, ((v % 2) + 2) % 2]))
  }
  return pick(0, [])
}

test('3875 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums1":[5,8,11]}')).result, true)
  assert.equal(buildTrace(parseInput('{"nums1":[6,10]}')).result, true)
})

test('3875 the answer is always true, matching a brute force oracle on small sets', () => {
  for (let trial = 0; trial < 200; trial++) {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const size = 1 + (trial % 4)
    const nums = pool.sort(() => Math.random() - 0.5).slice(0, size)
    assert.equal(oracle(nums), true, JSON.stringify(nums))
    assert.equal(buildTrace({ nums1: nums }).result, true)
  }
})
