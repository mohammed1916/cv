import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3010 official-style examples', () => {
  assert.equal(solve([1, 2, 3, 12]), 6)
  assert.equal(solve([5, 4, 3]), 12)
  assert.equal(solve([10, 3, 1, 1]), 12)
})

test('3010 fewer than three values is rejected', () => {
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: try every pair of cut points that yields three non-empty subarrays.
function oracle(nums) {
  const n = nums.length
  let best = Infinity
  for (let p = 1; p < n; p++) {
    for (let q = p + 1; q < n; q++) {
      best = Math.min(best, nums[0] + nums[p] + nums[q])
    }
  }
  return best
}

test('3010 random arrays match the cut-point oracle', () => {
  let seed = 3010
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 3 + rnd(6) }, () => 1 + rnd(20))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
