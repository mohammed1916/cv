import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3201 examples', () => {
  // 1 + 2, 2 + 3, 3 + 4 are all odd, so the whole array is valid.
  assert.equal(solve([1, 2, 3, 4]), 4)
  assert.equal(solve([1, 2, 1, 1, 2, 1, 2]), 6)
})

test('3201 a single element', () => {
  assert.equal(solve([7]), 1)
})

test('3201 rejects an empty array and a value of zero', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: try every subsequence and check that all neighbouring sums share a parity.
function oracle(nums) {
  let best = 1
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const picked = nums.filter((_, i) => (mask >> i) & 1)
    const parity = (picked[0] + picked[1]) % 2
    const ok = picked.every((v, i) => i < 2 || (picked[i - 1] + v) % 2 === parity)
    if (picked.length === 1 || ok) best = Math.max(best, picked.length)
  }
  return best
}

test('3201 random arrays match a subsequence-search oracle', () => {
  let seed = 3201
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
