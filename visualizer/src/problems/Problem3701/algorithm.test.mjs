import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3701 official examples', () => {
  assert.equal(solve([1, 3, 5, 7]), -4)
  assert.equal(solve([100]), 100)
})

test('3701 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[101]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: split the indices by parity with filter and sum each group.
function oracle(nums) {
  const even = nums.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0)
  const odd = nums.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0)
  return even - odd
}

test('3701 random arrays match a parity-filter oracle', () => {
  let seed = 3701
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(100))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
