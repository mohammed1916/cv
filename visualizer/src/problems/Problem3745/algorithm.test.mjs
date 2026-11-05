import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3745 worked examples', () => {
  assert.equal(solve([1, 4, 2, 5]), 8)
  assert.equal(solve([-2, 0, 5, -2, 4]), 11)
  assert.equal(solve([1, 5, 3, 2]), 7)
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([-1, -2, -3]), 0)
})

test('3745 rejects too few elements', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

// Oracle: every ordered choice of three distinct indices (a, b, c), scored as a + b - c.
function oracle(nums) {
  let best = null
  for (let a = 0; a < nums.length; a++) for (let b = 0; b < nums.length; b++) for (let c = 0; c < nums.length; c++) {
    if (new Set([a, b, c]).size !== 3) continue
    const v = nums[a] + nums[b] - nums[c]
    if (best === null || v > best) best = v
  }
  return best
}

test('3745 random arrays match an all-triples oracle', () => {
  let seed = 3745
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(6) }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
