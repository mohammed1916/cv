import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2354 official examples', () => {
  assert.equal(solve([1, 2, 3, 1], 3), 5)
  assert.equal(solve([5, 1, 1], 10), 0)
})

test('2354 edge cases: a single value pairs with itself', () => {
  assert.equal(solve([1], 1), 1)
  assert.equal(solve([1], 3), 0)
})

test('2354 rejects values out of range and an invalid k', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: test every ordered pair of distinct values with the OR and AND identity, not bit counts.
function countBits(v) {
  let count = 0
  for (let bit = 0; bit < 31; bit++) if ((v >> bit) & 1) count++
  return count
}

function oracle(nums, k) {
  const values = [...new Set(nums)]
  let total = 0
  for (const a of values) {
    for (const b of values) {
      const excellence = countBits(a | b) + countBits(a & b)
      if (excellence >= k) total++
    }
  }
  return total
}

test('2354 random arrays match a pairwise oracle', () => {
  let seed = 2354
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(255))
    const k = 1 + rnd(12)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
