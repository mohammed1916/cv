import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3550 official-style examples', () => {
  assert.equal(solve([1, 3, 2]), 2)
  assert.equal(solve([1, 10, 11, 12]), 1)
})

test('3550 returns -1 when nothing matches', () => {
  assert.equal(solve([5, 5, 5]), -1)
})

test('3550 rejects a value above 1000', () => {
  assert.throws(() => parseInput('[1001]'))
})

// Independent oracle: compute digit sums by repeated division instead of string conversion.
function oracle(nums) {
  for (let i = 0; i < nums.length; i++) {
    let s = 0
    let y = nums[i]
    while (y > 0) { s += y % 10; y = Math.floor(y / 10) }
    if (s === i) return i
  }
  return -1
}

test('3550 random arrays match a division-based oracle', () => {
  let seed = 3550
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => rnd(1001))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
