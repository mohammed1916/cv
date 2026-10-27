import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('2540 official examples', () => {
  assert.equal(solve([1, 2, 3], [2, 4]), 2)
  assert.equal(solve([1, 2, 3, 6], [2, 3, 4, 5]), 2)
  assert.equal(solve([1, 2, 3], [4, 5]), -1)
})

test('2540 edge cases: a shared first value and a repeated value', () => {
  assert.equal(solve([7], [7]), 7)
  assert.equal(solve([2, 2, 5], [2]), 2)
})

test('2540 rejects unsorted lists', () => {
  assert.throws(() => parseInput('{"nums1":[3,1],"nums2":[2]}'))
})

// Independent oracle: build a set from the second list and take the smallest member of the first list in it.
function oracle(nums1, nums2) {
  const inSecond = new Set(nums2)
  const common = nums1.filter(v => inSecond.has(v))
  return common.length ? Math.min(...common) : -1
}

test('2540 random sorted lists match a set-intersection oracle', () => {
  let seed = 2540
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const sortedList = () => Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12)).sort((a, b) => a - b)
  for (let t = 0; t < 300; t++) {
    const nums1 = sortedList()
    const nums2 = sortedList()
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
