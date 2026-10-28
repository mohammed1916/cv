import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('4063 official examples', () => {
  assert.equal(solve([4, 1, 2], 3), 3)
  assert.equal(solve([5, 3, 4], 7), 2)
  assert.equal(solve([2, 2, 5], 6), 2)
})

test('4063 negative values are reduced to a non-negative residue', () => {
  // -3 + 1 = -2, and negating the -3 gives 3 + 1 = 4; with k = 4, the whole array works by negating -3.
  assert.equal(solve([-3, 1], 4), 2)
})

test('4063 rejects k of 0', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: test every subarray, and every single negation inside it, directly.
function oracle(nums, k) {
  const mod = x => ((x % k) + k) % k
  let best = 0
  for (let l = 0; l < nums.length; l++) {
    let sum = 0
    for (let r = l; r < nums.length; r++) {
      sum += nums[r]
      let ok = mod(sum) === 0
      for (let i = l; i <= r && !ok; i++) {
        if (mod(sum - 2 * nums[i]) === 0) ok = true
      }
      if (ok) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('4063 random arrays match an all-subarrays oracle', () => {
  let seed = 4063
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(21) - 10)
    const k = 1 + rnd(7)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
