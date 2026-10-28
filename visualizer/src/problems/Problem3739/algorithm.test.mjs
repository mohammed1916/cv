import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace(parseInput(JSON.stringify({ nums, target }))).result

test('3739 examples with a majority and without one', () => {
  assert.equal(solve([1, 2, 2, 3], 2), 5)
  assert.equal(solve([1, 1, 1, 1], 2), 0)
})

test('3739 a single matching element is a majority by itself', () => {
  assert.equal(solve([3], 3), 1)
})

test('3739 rejects an empty nums array', () => {
  assert.throws(() => parseInput('{"nums":[],"target":1}'))
})

// Independent oracle: count occurrences of the target in every subarray and compare with its length.
function oracle(nums, target) {
  let total = 0
  for (let l = 0; l < nums.length; l++) {
    let c = 0
    for (let r = l; r < nums.length; r++) {
      if (nums[r] === target) c++
      if (2 * c > r - l + 1) total++
    }
  }
  return total
}

test('3739 seeded random inputs match an occurrence-count oracle', () => {
  let seed = 3739
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(4))
    const target = rnd(4)
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
