import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, m) => buildTrace({ nums, k, m }).result

test('3806 official examples', () => {
  assert.equal(solve([3, 1, 2], 8, 2), 6)
  assert.equal(solve([1, 2, 8, 4], 7, 3), 4)
  assert.equal(solve([1, 1], 3, 2), 2)
})

test('3806 edge case: one element with one increment becomes 10', () => {
  assert.equal(solve([9], 1, 1), 10)
})

test('3806 rejects m larger than the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3,"m":3}'))
})

// Independent oracle: try every subset of m elements. For each subset, find the largest target AND by brute force:
// each element's cost is found by scanning upward one value at a time, and targets are checked from 127 down to 0.
function oracle(nums, k, m) {
  const n = nums.length
  let best = 0
  const minSupersetBrute = (x, a) => {
    for (let y = x; ; y++) if ((y & a) === a) return y
  }
  for (let mask = 0; mask < 1 << n; mask++) {
    let size = 0
    const chosen = []
    for (let i = 0; i < n; i++) if (mask >> i & 1) { size++; chosen.push(nums[i]) }
    if (size !== m) continue
    for (let target = 127; target >= 0; target--) {
      let cost = 0
      for (const x of chosen) cost += minSupersetBrute(x, target) - x
      if (cost <= k) { best = Math.max(best, target); break }
    }
  }
  return best
}

test('3806 random small inputs match a subset-enumeration oracle', () => {
  let seed = 3806
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(5) + 1
    const nums = Array.from({ length: n }, () => rnd(15) + 1)
    const k = rnd(30) + 1
    const m = rnd(n) + 1
    assert.equal(solve(nums, k, m), oracle(nums, k, m), JSON.stringify({ nums, k, m }))
  }
})
