import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3681 official examples', () => {
  assert.equal(solve([1, 2, 3]), 3)
  assert.equal(solve([5, 2]), 7)
})

test('3681 zeros only give 0', () => {
  assert.equal(solve([0, 0]), 0)
})

test('3681 rejects a single value and a negative value', () => {
  assert.throws(() => parseInput('[5]'))
  assert.throws(() => parseInput('[1,-2]'))
})

// Independent oracle: try every pair of subsequences (both possibly empty) and take the largest XOR of their XOR totals.
function oracle(nums) {
  const totals = []
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let x = 0
    nums.forEach((v, i) => { if (mask & (1 << i)) x ^= v })
    totals.push(x)
  }
  let best = 0
  for (const a of totals) for (const b of totals) best = Math.max(best, a ^ b)
  return best
}

test('3681 random arrays match a pairwise-subsequence oracle', () => {
  let seed = 3681
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 2 + rnd(6) }, () => rnd(64))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
