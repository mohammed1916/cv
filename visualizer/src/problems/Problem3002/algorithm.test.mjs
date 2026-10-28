import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3002 official examples', () => {
  assert.equal(solve({ nums1: [1, 2, 1, 2], nums2: [1, 1, 1, 1] }), 2)
  assert.equal(solve({ nums1: [1, 2, 3, 4, 5, 6], nums2: [2, 3, 2, 3, 2, 3] }), 5)
  assert.equal(solve({ nums1: [1, 1, 2, 2, 3, 3], nums2: [4, 4, 5, 5, 6, 6] }), 6)
})

test('3002 an odd length is rejected', () => {
  assert.throws(() => parseInput('{"nums1":[1,2,3],"nums2":[1,2,3]}'))
})

// Independent oracle: try every choice of half the indices from each array and count the distinct values kept.
function oracle(nums1, nums2) {
  const n = nums1.length
  const half = n / 2
  const subsets = arr => {
    const out = []
    for (let mask = 0; mask < 1 << n; mask++) {
      let count = 0
      for (let i = 0; i < n; i++) if (mask & (1 << i)) count++
      if (count === half) out.push(arr.filter((_, i) => mask & (1 << i)))
    }
    return out
  }
  let best = 0
  for (const keep1 of subsets(nums1)) {
    for (const keep2 of subsets(nums2)) {
      best = Math.max(best, new Set([...keep1, ...keep2]).size)
    }
  }
  return best
}

test('3002 random inputs match the subset oracle', () => {
  let seed = 3002
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 * (1 + rnd(4))
    const nums1 = Array.from({ length: n }, () => 1 + rnd(9))
    const nums2 = Array.from({ length: n }, () => 1 + rnd(9))
    assert.equal(solve({ nums1, nums2 }), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
