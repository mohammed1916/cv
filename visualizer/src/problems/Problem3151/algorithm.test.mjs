import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3151 worked examples', () => {
  assert.equal(solve([1]), true)
  assert.equal(solve([2, 1, 4]), true)
  assert.equal(solve([4, 3, 1, 6]), false)
})

test('3151 edge cases', () => {
  assert.equal(solve([2]), true)
  assert.equal(solve([2, 2]), false)
  assert.equal(solve([1, 2, 3, 4, 5, 6]), true)
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: compare each neighbor pair's parity bits directly.
function oracle(nums) {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] % 2 === nums[i - 1] % 2) return false
  }
  return true
}

test('3151 random arrays match the parity oracle', () => {
  let seed = 3151
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
