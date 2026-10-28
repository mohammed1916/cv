import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3637 official-style examples', () => {
  assert.equal(solve([1, 3, 5, 4, 2, 6]), true)
  assert.equal(solve([2, 1, 3]), false)
  assert.equal(solve([1, 2, 3, 4]), false)
  assert.equal(solve([3, 2, 1, 4]), false)
})

test('3637 rejects a value outside the range and a short array', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('[1,2,1001]'))
})

// Independent oracle: try every pair of turning points (p, q) and test the three segments directly.
function oracle(nums) {
  const n = nums.length
  const rising = (a, b) => { for (let i = a; i < b; i++) if (!(nums[i] < nums[i + 1])) return false; return true }
  const falling = (a, b) => { for (let i = a; i < b; i++) if (!(nums[i] > nums[i + 1])) return false; return true }
  for (let p = 1; p < n; p++) {
    for (let q = p + 1; q < n - 1; q++) {
      if (rising(0, p) && falling(p, q) && rising(q, n - 1)) return true
    }
  }
  return false
}

test('3637 random arrays match a segment-enumeration oracle', () => {
  let seed = 3637
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let trues = 0, falses = 0
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(7) - 3)
    const expected = oracle(nums)
    if (expected) trues++; else falses++
    assert.equal(solve(nums), expected, JSON.stringify(nums))
  }
  assert.ok(trues > 0 && falses > 0)
})
