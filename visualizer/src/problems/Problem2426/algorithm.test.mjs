import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2, diff) => buildTrace(parseInput(JSON.stringify({ nums1, nums2, diff }))).result

test('2426 official examples', () => {
  assert.equal(solve([3, 2, 5], [2, 2, 1], 2), 3)
  assert.equal(solve([1, 2, 3], [1, 1, 1], 0), 3)
})

test('2426 a diff of zero counts only non-decreasing differences', () => {
  // d = [2, 1, 3]: pairs (0,1) fails since 2 - 1 > 0; (0,2) and (1,2) pass.
  assert.equal(solve([3, 2, 4], [1, 1, 1], 0), 2)
})

test('2426 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1],"diff":0}'))
})

// Independent oracle: keep the sorted differences seen so far and binary-search the count.
function oracle(nums1, nums2, diff) {
  const sorted = []
  let total = 0
  for (let j = 0; j < nums1.length; j++) {
    const dj = nums1[j] - nums2[j]
    // Count earlier values d[i] <= dj + diff with a binary search over the sorted list.
    let lo = 0
    let hi = sorted.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid] <= dj + diff) lo = mid + 1
      else hi = mid
    }
    total += lo
    // Insert dj at its own sorted position, found by the same kind of search for dj.
    let at = 0
    while (at < sorted.length && sorted[at] <= dj) at++
    sorted.splice(at, 0, dj)
  }
  return total
}

test('2426 random arrays match a sorted-list binary-search oracle', () => {
  let seed = 2426
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(13)
    const nums1 = Array.from({ length: n }, () => rnd(10))
    const nums2 = Array.from({ length: n }, () => rnd(10))
    const diff = rnd(10)
    assert.equal(solve(nums1, nums2, diff), oracle(nums1, nums2, diff), JSON.stringify({ nums1, nums2, diff }))
  }
})
