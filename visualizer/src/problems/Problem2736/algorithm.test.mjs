import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2, queries) => buildTrace({ nums1, nums2, queries }).result

test('2736 worked examples', () => {
  assert.deepEqual(solve([4, 3, 1, 2], [2, 4, 9, 5], [[4, 1], [1, 3], [2, 5]]), [6, 10, 7])
  assert.deepEqual(solve([3, 2, 1], [2, 3, 4], [[4, 4], [3, 2], [1, 1]]), [-1, 5, 5])
})

test('2736 edge cases', () => {
  assert.deepEqual(solve([1], [1], [[1, 1]]), [2])
  assert.deepEqual(solve([1], [1], [[2, 1]]), [-1])
  assert.deepEqual(solve([5, 5], [5, 5], [[5, 5], [6, 1]]), [10, -1])
})

test('2736 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1,2],"queries":[[1,1]]}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"queries":[[1]]}'))
})

// Independent oracle: check every index for every query.
function oracle(nums1, nums2, queries) {
  return queries.map(([x, y]) => {
    let best = -1
    nums1.forEach((a, i) => { if (a >= x && nums2[i] >= y) best = Math.max(best, a + nums2[i]) })
    return best
  })
}

test('2736 random inputs match a brute-force oracle', () => {
  let seed = 2736
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(7)
    const nums1 = Array.from({ length: len }, () => 1 + rnd(12))
    const nums2 = Array.from({ length: len }, () => 1 + rnd(12))
    const queries = Array.from({ length: 1 + rnd(5) }, () => [1 + rnd(12), 1 + rnd(12)])
    assert.deepEqual(solve(nums1, nums2, queries), oracle(nums1, nums2, queries), JSON.stringify({ nums1, nums2, queries }))
  }
})
