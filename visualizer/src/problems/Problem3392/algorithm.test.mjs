import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3392 official-style examples', () => {
  assert.equal(solve([1, 2, 1, 4, 1]), 1)
  assert.equal(solve([1, 1, 1]), 0)
})

test('3392 needs at least three values', () => {
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: test each window with a division instead of the doubled sum.
function oracle(nums) {
  let count = 0
  for (let i = 0; i + 2 < nums.length; i++) {
    const a = nums[i], b = nums[i + 1], c = nums[i + 2]
    if (a + c === b / 2) count++
  }
  return count
}

test('3392 random arrays match a division-based oracle', () => {
  let seed = 3392
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(10)
    const nums = Array.from({ length: n }, () => rnd(11) - 5)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
