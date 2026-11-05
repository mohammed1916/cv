import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('2321 worked examples', () => {
  assert.equal(solve([5, 1, 8], [2, 9, 3]), 22)
  assert.equal(solve([3, 3, 3], [1, 9, 2]), 15)
})

test('2321 no splice helps when nums1 is already best', () => {
  assert.equal(solve([9, 9], [1, 1]), 18)
})

test('2321 rejects unequal lengths', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1,2]}'))
})

// Oracle: try every interval in both directions and take the best total.
function oracle(nums1, nums2) {
  const n = nums1.length
  const s1 = nums1.reduce((s, x) => s + x, 0)
  const s2 = nums2.reduce((s, x) => s + x, 0)
  let best = Math.max(s1, s2)
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      let d = 0
      for (let i = l; i <= r; i++) d += nums2[i] - nums1[i]
      best = Math.max(best, s1 + d, s2 - d)
    }
  }
  return best
}

test('2321 random inputs match an all-intervals oracle', () => {
  let seed = 2321
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums1 = Array.from({ length: n }, () => 1 + rnd(20))
    const nums2 = Array.from({ length: n }, () => 1 + rnd(20))
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
