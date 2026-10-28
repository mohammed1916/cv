import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

// Independent oracle: try every subset of indices to swap; the final last elements must be the maxima of their arrays.
function oracle(nums1, nums2) {
  const n = nums1.length
  let best = -1
  for (let mask = 0; mask < 1 << n; mask++) {
    const a = nums1.map((v, i) => ((mask >> i) & 1 ? nums2[i] : v))
    const b = nums2.map((v, i) => ((mask >> i) & 1 ? nums1[i] : v))
    if (a[n - 1] === Math.max(...a) && b[n - 1] === Math.max(...b)) {
      let cost = 0
      for (let i = 0; i < n; i++) cost += (mask >> i) & 1
      if (best === -1 || cost < best) best = cost
    }
  }
  return best
}

test('2934 examples', () => {
  assert.equal(solve([1, 2, 7], [4, 5, 3]), 1)
  assert.equal(solve([1, 9], [9, 2]), 1)
  assert.equal(solve([1, 5, 4], [2, 5, 3]), -1)
})

test('2934 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
})

test('2934 random arrays match a subset-of-swaps oracle', () => {
  let seed = 2934
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums1 = Array.from({ length: n }, () => 1 + rnd(9))
    const nums2 = Array.from({ length: n }, () => 1 + rnd(9))
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
