import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3880 worked examples', () => {
  assert.equal(solve([1, 2, 3, 2]), 1)
  assert.equal(solve([1, 1, 1]), -1)
  assert.equal(solve([2, 1]), 1)
})

test('3880 edge cases', () => {
  assert.equal(solve([2]), -1)
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([1, 1, 2, 2, 1]), 1)
  assert.equal(solve([1, 2, 2, 2, 2, 1]), 1)
  assert.equal(solve([2, 2, 1, 2]), 1)
})

test('3880 rejects values other than 1 and 2', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[3, 1]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Oracle: check every pair of indices directly.
function oracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (nums[i] === 1 && nums[j] === 2) {
        const gap = Math.abs(i - j)
        if (best === -1 || gap < best) best = gap
      }
    }
  }
  return best
}

test('3880 random inputs match a pairwise oracle', () => {
  let seed = 3880
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(2))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
