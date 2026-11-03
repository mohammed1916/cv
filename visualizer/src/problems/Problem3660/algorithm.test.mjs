import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3660 worked examples', () => {
  assert.deepEqual(solve([2, 1, 3]), [2, 2, 3])
  assert.deepEqual(solve([4, 1, 3, 2]), [4, 4, 4, 4])
})

test('3660 a peak passes its value to both neighbours', () => {
  assert.deepEqual(solve([1, 5, 2]), [1, 5, 5])
})

test('3660 rejects a missing array', () => {
  assert.throws(() => parseInput('{"values":[1]}'))
})
