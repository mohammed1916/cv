import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, limit) => buildTrace(parseInput(JSON.stringify({ nums, k, limit }))).result

test('3509 official examples', () => {
  assert.equal(solve([1, 2, 3], 2, 10), 6)
  assert.equal(solve([0, 2, 3], -5, 12), -1)
  assert.equal(solve([2, 2, 3, 3], 0, 9), 9)
})

test('3509 a single value', () => {
  assert.equal(solve([4], 4, 5), 4)
  assert.equal(solve([4], 4, 3), -1)
})

test('3509 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[13],"k":0,"limit":5}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0,"limit":0}'))
})

// Independent oracle: enumerate every non-empty subsequence (by bitmask), compute its alternating sum and product.
function oracle(nums, k, limit) {
  let best = -1
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let alt = 0
    let product = 1
    let sign = 1
    for (let i = 0; i < nums.length; i++) {
      if (!(mask & (1 << i))) continue
      alt += sign * nums[i]
      product *= nums[i]
      sign = -sign
    }
    if (alt === k && product <= limit && product > best) best = product
  }
  return best
}

test('3509 random arrays match a subsequence enumeration oracle', () => {
  let seed = 3509
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(13))
    const k = rnd(15) - 7
    const limit = 1 + rnd(200)
    assert.equal(solve(nums, k, limit), oracle(nums, k, limit), JSON.stringify({ nums, k, limit }))
  }
})
