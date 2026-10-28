import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3427 official-style examples', () => {
  assert.equal(solve([2, 3, 1]), 11)
  assert.equal(solve([3, 1, 1, 2]), 13)
})

test('3427 rejects zero and values above 1000', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1001]'))
})

// Independent oracle: for each index, test every earlier position against the window bound instead of slicing.
function oracle(nums) {
  let total = 0
  nums.forEach((v, i) => {
    for (let j = 0; j <= i; j++) if (j >= i - v) total += nums[j]
  })
  return total
}

test('3427 random arrays match a position-filter oracle', () => {
  let seed = 3427
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const nums = Array.from({ length: n }, () => 1 + rnd(1000))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
