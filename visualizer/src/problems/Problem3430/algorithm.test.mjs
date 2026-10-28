import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3430 official examples', () => {
  assert.equal(solve([1, 2, 3], 2), 20)
  assert.equal(solve([1, -3, 1], 2), -6)
})

test('3430 k of one counts each element twice', () => {
  assert.equal(solve([4, -1, 7], 1), 2 * (4 + -1 + 7))
})

test('3430 rejects k larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: enumerate every subarray of length 1 to k, sort it, and add its first and
// last values (the minimum and the maximum).
function oracle(nums, k) {
  let total = 0
  for (let len = 1; len <= k; len++) {
    for (let start = 0; start + len <= nums.length; start++) {
      const sorted = nums.slice(start, start + len).sort((a, b) => a - b)
      total += sorted[0] + sorted[sorted.length - 1]
    }
  }
  return total
}

test('3430 random arrays match an enumerate-and-sort oracle', () => {
  let seed = 3430
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const k = 1 + rnd(n)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
