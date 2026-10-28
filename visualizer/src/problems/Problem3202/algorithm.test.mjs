import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3202 examples', () => {
  // Every neighbouring pair of 1, 2, 3, 4, 5 sums to an odd number, so the whole array is valid for k = 2.
  assert.equal(solve([1, 2, 3, 4, 5], 2), 5)
  // With k = 3, any two numbers form a valid pair, but three need equal pair sums mod 3.
  assert.equal(solve([1, 2, 3], 3), 2)
})

test('3202 a single element', () => {
  assert.equal(solve([9], 4), 1)
})

test('3202 rejects k outside 1 to 5', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: try every subsequence and check that all neighbouring pair sums share a remainder mod k.
function oracle(nums, k) {
  let best = 1
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const picked = nums.filter((_, i) => (mask >> i) & 1)
    if (picked.length < 2) continue
    const target = (picked[0] + picked[1]) % k
    const ok = picked.every((v, i) => i === 0 || (picked[i - 1] + v) % k === target)
    if (ok) best = Math.max(best, picked.length)
  }
  return best
}

test('3202 random inputs match a subsequence-search oracle', () => {
  let seed = 3202
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(9))
    const k = 1 + rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
