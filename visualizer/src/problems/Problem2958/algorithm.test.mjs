import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2958 official examples', () => {
  assert.equal(solve([1, 2, 3, 1, 2, 3, 1, 2], 2), 6)
  assert.equal(solve([1, 2, 1, 2, 1, 2, 1, 2], 1), 2)
  assert.equal(solve([5, 5, 5, 5, 5, 5, 5], 4), 4)
})

test('2958 a single repeated value under k keeps the whole array', () => {
  assert.equal(solve([3, 3], 2), 2)
})

test('2958 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: test every subarray and count frequencies directly.
function oracle(nums, k) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const seen = new Map()
      let ok = true
      for (let t = i; t <= j && ok; t++) {
        seen.set(nums[t], (seen.get(nums[t]) || 0) + 1)
        if (seen.get(nums[t]) > k) ok = false
      }
      if (ok) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('2958 random arrays match a brute-force oracle', () => {
  let seed = 2958
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(16) }, () => 1 + rnd(5))
    const k = 1 + rnd(5)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
