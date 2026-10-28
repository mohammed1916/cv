import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3164 official examples', () => {
  assert.equal(solve({ nums1: [1, 3, 4], nums2: [1, 3, 4], k: 1 }), 5)
  assert.equal(solve({ nums1: [1, 2, 4, 12], nums2: [2, 4], k: 3 }), 2)
})

test('3164 repeated values in nums1 each count as a separate index', () => {
  assert.equal(solve({ nums1: [2, 2, 2], nums2: [1], k: 2 }), 3)
  assert.equal(solve({ nums1: [5], nums2: [1], k: 1 }), 1)
})

test('3164 rejects out-of-range fields', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"k":0}'))
  assert.throws(() => parseInput('{"nums1":[31],"nums2":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[9],"k":1}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: check every index pair directly, with no grouping.
function oracle({ nums1, nums2, k }) {
  let count = 0
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length; j++) {
      if (nums1[i] % (nums2[j] * k) === 0) count++
    }
  }
  return count
}

test('3164 random inputs match a pair-by-pair oracle', () => {
  let seed = 3164
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const input = {
      nums1: Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12)),
      nums2: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(6)),
      k: 1 + rnd(4),
    }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
