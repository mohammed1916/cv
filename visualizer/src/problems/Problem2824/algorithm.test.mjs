import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('2824 official examples', () => {
  assert.equal(solve([-6, 2, 5, -2, -7, -1, 3], -2), 10)
  assert.equal(solve([-1, 1, 2, 3, 1], 3), 5)
  assert.equal(solve([-6, 2, 5, -2, -7, -1, 3], -2), 10)
})

test('2824 equal values and a single pair', () => {
  assert.equal(solve([1, 1], 3), 1)
  assert.equal(solve([1, 1], 2), 0)
})

test('2824 rejects values outside the bounds', () => {
  assert.throws(() => parseInput('{"nums":[51],"target":0}'))
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Independent oracle: test every index pair directly.
function oracle(nums, target) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] < target) count++
    }
  }
  return count
}

test('2824 random arrays match a pairwise oracle', () => {
  let seed = 2824
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => rnd(101) - 50)
    const target = rnd(201) - 100
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
