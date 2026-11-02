import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2916 worked examples', () => {
  assert.equal(solve([1, 2, 1]), 15)
  assert.equal(solve([1, 1]), 3)
})

test('2916 edge cases', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([1, 2, 3]), 20)
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: enumerate every subarray and count its distinct values directly.
function oracle(nums) {
  let total = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const d = new Set(nums.slice(i, j + 1)).size
      total = (total + d * d) % 1000000007
    }
  }
  return total
}

test('2916 random arrays match a subarray oracle', () => {
  let seed = 2916
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
