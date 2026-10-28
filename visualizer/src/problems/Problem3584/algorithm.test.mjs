import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, m) => buildTrace(parseInput(JSON.stringify({ nums, m }))).result

test('3584 official examples', () => {
  assert.equal(solve([-1, -9, 2, 3, -2, -3, 1], 1), 81)
  assert.equal(solve([1, 3, -5, 5, 6, -4], 3), 20)
  assert.equal(solve([2, -1, 2, -6, 5, 2, -5, 7], 2), 35)
})

test('3584 with m equal to the length the first and last are the ends', () => {
  assert.equal(solve([4, 9, -2], 3), -8)
})

test('3584 rejects m above the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"m":3}'))
})

// Independent oracle: enumerate every subsequence of exactly m indices and read its first and last values.
function oracle(nums, m) {
  const n = nums.length
  let best = null
  for (let mask = 0; mask < 1 << n; mask++) {
    const picked = []
    for (let i = 0; i < n; i++) if ((mask >> i) & 1) picked.push(nums[i])
    if (picked.length !== m) continue
    const product = picked[0] * picked[picked.length - 1]
    if (best === null || product > best) best = product
  }
  return best
}

test('3584 random arrays match a subsequence enumeration oracle', () => {
  let seed = 3584
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const m = 1 + rnd(n)
    assert.equal(solve(nums, m), oracle(nums, m), JSON.stringify({ nums, m }))
  }
})
