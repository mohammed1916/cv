import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every keep-or-subtract choice with the strictly-positive rule.
function oracle(nums) {
  const n = nums.length
  const options = i => [nums[i], ...nums.flatMap((v, j) => (j === i || nums[i] - v < 1 ? [] : [nums[i] - v]))]
  const pick = (i, parities) => {
    if (i === n) return new Set(parities).size === 1
    return options(i).some(v => pick(i + 1, [...parities, ((v % 2) + 2) % 2]))
  }
  return pick(0, [])
}

test('3876 worked examples', () => {
  assert.equal(buildTrace(parseInput('{"nums1":[3,6,9]}')).result, true)
  assert.equal(buildTrace(parseInput('{"nums1":[5,4]}')).result, false)
  assert.equal(buildTrace(parseInput('{"nums1":[8,12]}')).result, true)
})

test('3876 matches a brute force oracle on small random sets', () => {
  for (let trial = 0; trial < 300; trial++) {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const size = 1 + (trial % 5)
    const nums = pool.slice().sort(() => Math.random() - 0.5).slice(0, size)
    assert.equal(buildTrace({ nums1: nums }).result, oracle(nums), JSON.stringify(nums))
  }
})
