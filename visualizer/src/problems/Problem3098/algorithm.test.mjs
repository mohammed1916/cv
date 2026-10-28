import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3098 official examples', () => {
  assert.equal(solve([1, 2, 3, 4], 3), 4)
  assert.equal(solve([2, 2], 2), 0)
  assert.equal(solve([4, 3, -1], 2), 10)
})

test('3098 a single pair is its own power', () => {
  assert.equal(solve([0, 9], 2), 9)
})

test('3098 rejects k below two', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":1}'))
})

// Independent oracle: enumerate every subset of size k with a bitmask, take its smallest pairwise
// difference (its power), and add the powers.
function oracle(nums, k) {
  const n = nums.length
  let total = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) picked.push(nums[i])
    if (picked.length !== k) continue
    let power = Infinity
    for (let i = 0; i < picked.length; i++) {
      for (let j = i + 1; j < picked.length; j++) power = Math.min(power, Math.abs(picked[i] - picked[j]))
    }
    total += power
  }
  return total % 1000000007
}

test('3098 random arrays match a bitmask enumeration', () => {
  let seed = 3098
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const k = 2 + rnd(n - 1)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
