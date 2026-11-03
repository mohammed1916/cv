import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

test('3868 invented example with one surplus', () => {
  assert.equal(solve([1, 1, 2], [2, 3, 3]), 1)
})

test('3868 equal counts cost nothing', () => {
  assert.equal(solve([5, 6], [6, 5]), 0)
})

test('3868 two surplus values', () => {
  assert.equal(solve([1, 1], [2, 2]), 1)
})

test('3868 an odd total is impossible', () => {
  assert.equal(solve([1], [2]), -1)
})
