import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3659 worked examples', () => {
  assert.equal(solve([4, 1, 4, 3], 2), true)
  assert.equal(solve([2, 6, 2, 6], 2), true)
  assert.equal(solve([7, 7, 4, 9, 1, 3], 3), true)
  assert.equal(solve([7, 7, 7, 4, 9, 1], 3), false)
})

test('3659 a value repeated more than the group count fails', () => {
  assert.equal(solve([2, 2, 2, 1], 2), false)
})

test('3659 k of one always works', () => {
  assert.equal(solve([7, 7, 7], 1), true)
})

test('3659 rejects k above the length', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})
