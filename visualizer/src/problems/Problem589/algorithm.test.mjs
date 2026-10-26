import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('589 official examples and edge cases', () => {
  assert.deepEqual(buildTrace([1, null, 3, 2, 4, null, 5, 6]).result, [1, 3, 5, 6, 2, 4])
  assert.deepEqual(buildTrace([1, null, 2, 3, 4, 5, null, null, 6, 7, null, 8, null, 9, 10, null, null, 11, null, 12, null, 13, null, null, 14]).result.length, 14)
  assert.deepEqual(buildTrace([]).result, [])
  assert.deepEqual(buildTrace([7]).result, [7])
})

test('589 chains and stars match a direct recursive construction', () => {
  // Chain 1-2-3-4-5: each node has one child.
  assert.deepEqual(buildTrace([1, null, 2, null, 3, null, 4, null, 5]).result, [1, 2, 3, 4, 5])
  // Star: root 0 with children 1..4.
  assert.deepEqual(buildTrace([0, null, 1, 2, 3, 4]).result, [0, 1, 2, 3, 4])
})

test('589 rejects a null root', () => {
  assert.throws(() => parseInput('[null,1]'))
})
