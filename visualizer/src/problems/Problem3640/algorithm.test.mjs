import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3640 official examples', () => {
  assert.equal(solve([0, -2, -1, -3, 0, 2, -1]), -4)
  assert.equal(solve([1, 4, 2, 7]), 14)
})

test('3640 the whole array can be the trionic subarray', () => {
  // 1 < 2 < 5, then 5 > 3 > 0, then 0 < 4 < 6: the full array sums to 28.
  assert.equal(solve([1, 2, 5, 3, 0, 4, 6]), 21)
  assert.equal(solve([1, 4, 2, 7, 0]), 14)
})

test('3640 rejects an array with no trionic subarray', () => {
  assert.throws(() => parseInput('{"nums":[5,4,3,2]}'), /trionic/)
})

// Independent oracle: try every l < p < q < r and check the three strictly monotone pieces.
function oracle(nums) {
  const n = nums.length
  let best = -Infinity
  const rising = (a, b) => { for (let i = a; i < b; i++) if (nums[i] >= nums[i + 1]) return false; return true }
  const falling = (a, b) => { for (let i = a; i < b; i++) if (nums[i] <= nums[i + 1]) return false; return true }
  for (let l = 0; l < n; l++) {
    for (let p = l + 1; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        for (let r = q + 1; r < n; r++) {
          if (!rising(l, p) || !falling(p, q) || !rising(q, r)) continue
          let sum = 0
          for (let i = l; i <= r; i++) sum += nums[i]
          best = Math.max(best, sum)
        }
      }
    }
  }
  return best
}

test('3640 random arrays match a brute-force oracle', () => {
  let seed = 3640
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 4 + rnd(8) }, () => rnd(11) - 5)
    const expected = oracle(nums)
    if (!Number.isFinite(expected)) continue
    checked++
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
  assert.ok(checked > 50)
})
