import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('1537 official examples', () => {
  assert.equal(solve([2, 4, 5, 8, 10], [4, 6, 8, 9]), 30)
  assert.equal(solve([1, 3, 5, 7, 9], [3, 5, 100]), 109)
  assert.equal(solve([1, 2, 3, 4, 5], [6, 7, 8, 9, 10]), 40)
})

test('1537 edge cases: disjoint lists and a single shared value', () => {
  assert.equal(solve([1], [2]), 2)
  assert.equal(solve([5], [5]), 5)
})

test('1537 rejects lists that are not strictly increasing', () => {
  assert.throws(() => parseInput('{"nums1":[1,1],"nums2":[2]}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[0]}'))
})

// Independent oracle: try every choice of list after each shared value, and every starting list.
function oracle(nums1, nums2) {
  const common = nums1.filter(v => nums2.includes(v)).sort((x, y) => x - y)
  const k = common.length
  const lists = [nums1, nums2]
  const between = (list, lo, hi) => list.reduce((sum, v) => (v > lo && v < hi ? sum + v : sum), 0)
  let best = 0
  for (let start = 0; start < 2; start++) {
    for (let mask = 0; mask < 2 ** k; mask++) {
      let total = 0
      let previous = -Infinity
      let current = start
      for (let t = 0; t < k; t++) {
        total += between(lists[current], previous, common[t]) + common[t]
        previous = common[t]
        current = (mask >> t) & 1
      }
      total += between(lists[current], previous, Infinity)
      best = Math.max(best, total)
    }
  }
  return best % 1000000007
}

test('1537 random lists match a path enumeration oracle', () => {
  let seed = 1537
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const sortedSubset = () => {
    const out = []
    for (let v = 1; v <= 30 && out.length < 6; v++) if (rnd(3) === 0) out.push(v)
    return out.length ? out : [1 + rnd(30)]
  }
  for (let t = 0; t < 300; t++) {
    const nums1 = sortedSubset()
    const nums2 = sortedSubset()
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
