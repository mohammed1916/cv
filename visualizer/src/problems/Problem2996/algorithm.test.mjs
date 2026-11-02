import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2996 worked examples', () => {
  assert.equal(solve([1, 2, 3, 5]), 6)
  assert.equal(solve([3, 4, 5, 1, 12, 14, 13]), 15)
})

test('2996 edge cases', () => {
  assert.equal(solve([1]), 2)
  assert.equal(solve([2]), 3)
  assert.equal(solve([5, 1, 2]), 6)
  assert.equal(solve([1, 2, 3, 4, 5]), 15)
})

test('2996 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: the longest sequential prefix is the largest k whose prefix is sequential.
function oracle(nums) {
  let k = 1
  for (let len = 1; len <= nums.length; len++) {
    let ok = true
    for (let i = 1; i < len; i++) if (nums[i] !== nums[i - 1] + 1) ok = false
    if (ok) k = len
  }
  let x = nums.slice(0, k).reduce((a, b) => a + b, 0)
  while (nums.includes(x)) x++
  return x
}

test('2996 random inputs match a brute-force oracle', () => {
  let seed = 2996
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(12))
    if (rnd(2)) for (let i = 1; i < len; i++) nums[i] = nums[i - 1] + 1
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
