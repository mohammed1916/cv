import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3825 official examples', () => {
  assert.equal(solve([5, 4, 7]), 2)
  assert.equal(solve([2, 3, 6]), 3)
  assert.equal(solve([0, 1]), 1)
})

test('3825 edge case: all zeros give no valid subsequence', () => {
  assert.equal(solve([0, 0, 0]), 0)
})

test('3825 rejects a negative value', () => {
  assert.throws(() => parseInput('{"nums":[-1]}'))
})

// Independent oracle: enumerate every subset of indices, keep the strictly increasing ones whose AND is non-zero, and take the largest.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if (mask >> i & 1) picked.push(nums[i])
    let increasing = true
    for (let i = 1; i < picked.length; i++) if (picked[i] <= picked[i - 1]) { increasing = false; break }
    if (!increasing) continue
    let and = picked[0]
    for (const x of picked) and &= x
    if (and !== 0 && picked.length > best) best = picked.length
  }
  return best
}

test('3825 random arrays match a subset-enumeration oracle', () => {
  let seed = 3825
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(10) + 1
    const nums = Array.from({ length: n }, () => rnd(64))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
