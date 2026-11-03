import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2, k) => buildTrace({ nums1, nums2, k }).result

test('3478 hand-checked case', () => {
  assert.deepEqual(solve([3, 1, 3, 2], [5, 2, 7, 4], 2), [6, 0, 6, 2])
  assert.deepEqual(solve([1, 5, 3], [4, 6, 2], 3), [0, 6, 4])
})

test('3478 equal nums1 values never count each other', () => {
  assert.deepEqual(solve([2, 2, 2], [9, 8, 7], 2), [0, 0, 0])
})

test('3478 the final trace frame reports the result', () => {
  const trace = buildTrace({ nums1: [3, 1, 3, 2], nums2: [5, 2, 7, 4], k: 2 })
  assert.deepEqual(trace.frames.at(-1).answer, trace.result)
})

test('3478 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"k":2}'))
})

// Independent oracle: for each index, sort every eligible nums2 value and take the top k.
function oracle(nums1, nums2, k) {
  return nums1.map(x => nums2
    .filter((_, j) => nums1[j] < x)
    .sort((a, b) => b - a)
    .slice(0, k)
    .reduce((sum, value) => sum + value, 0))
}

test('3478 agrees with a brute-force oracle on random inputs', () => {
  let s = 3478
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  for (let t = 0; t < 300; t++) {
    const n = int(1, 9)
    const nums1 = Array.from({ length: n }, () => int(1, 6))
    const nums2 = Array.from({ length: n }, () => int(1, 50))
    const k = int(1, n)
    assert.deepEqual(solve(nums1, nums2, k), oracle(nums1, nums2, k))
  }
})
