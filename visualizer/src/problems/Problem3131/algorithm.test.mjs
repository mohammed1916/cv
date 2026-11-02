import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('3131 worked examples', () => {
  assert.equal(solve([2, 6, 4], [9, 7, 5]), 3)
  assert.equal(solve([10], [5]), -5)
})

test('3131 edge cases', () => {
  assert.equal(solve([1, 1, 1, 1], [1, 1, 1, 1]), 0)
  assert.equal(solve([-3, 0], [-1, 2]), 2)
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
})

// Independent oracle: try every integer shift and check the sorted arrays for equality.
function oracle(nums1, nums2) {
  const target = [...nums2].sort((a, b) => a - b).join(',')
  for (let x = -2000; x <= 2000; x++) {
    if (nums1.map(v => v + x).sort((a, b) => a - b).join(',') === target) return x
  }
  return null
}

test('3131 random inputs match the shift oracle', () => {
  let seed = 3131
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(6)
    const nums1 = Array.from({ length: n }, () => rnd(21) - 10)
    const shift = rnd(21) - 10
    const nums2 = nums1.map(v => v + shift).sort(() => rnd(2) - 0.5)
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
