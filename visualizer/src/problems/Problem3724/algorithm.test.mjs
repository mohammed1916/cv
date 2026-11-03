import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('3724 hand-checked cases', () => {
  assert.equal(solve([2, 8], [1, 3, 7]), 4)
  assert.equal(solve([5], [5, 5]), 1)
  assert.equal(solve([1, 2], [1, 2, 10]), 9)
})

test('3724 rejects a wrong length pair', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1,2]}'))
})
