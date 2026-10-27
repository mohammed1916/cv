import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

test('2425 official examples', () => {
  assert.equal(solve([2, 1, 3], [10, 2, 5, 0]), 13)
  assert.equal(solve([1, 2], [3, 4]), 0)
})

test('2425 a single pair is its own xor', () => {
  assert.equal(solve([7], [9]), 14)
})

test('2425 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums1":[],"nums2":[1]}'))
})

// Independent oracle: build every pair's xor explicitly and xor them all together.
function oracle(nums1, nums2) {
  let result = 0
  for (const a of nums1) for (const b of nums2) result ^= a ^ b
  return result
}

test('2425 random arrays match the all-pairs oracle', () => {
  let seed = 2425
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums1 = Array.from({ length: 1 + rnd(6) }, () => rnd(16))
    const nums2 = Array.from({ length: 1 + rnd(6) }, () => rnd(16))
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
