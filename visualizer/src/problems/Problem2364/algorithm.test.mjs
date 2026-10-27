import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2364 official examples', () => {
  assert.equal(solve([4, 1, 3, 3]), 5)
  assert.equal(solve([1, 2, 3, 4, 5]), 0)
})

test('2364 a single element has no pairs', () => {
  assert.equal(solve([7]), 0)
})

test('2364 rejects a negative value', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums: [-1] })))
})

// Independent oracle: compare every pair directly.
function oracle(nums) {
  let bad = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[j] - nums[i] !== j - i) bad++
    }
  }
  return bad
}

test('2364 random arrays match a direct pair comparison', () => {
  let seed = 2364
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
