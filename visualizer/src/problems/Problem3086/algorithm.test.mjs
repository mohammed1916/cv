import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, maxChanges) => buildTrace({ nums, k, maxChanges }).result

test('3086 hand-checked cases', () => {
  assert.equal(solve([0, 1, 1, 0, 1], 3, 0), 3)
  assert.equal(solve([0, 0, 0, 0, 0], 3, 3), 7)
  assert.equal(solve([1, 0, 0, 0, 1], 2, 0), 4)
})

test('3086 rejects too few ones and changes', () => {
  assert.throws(() => parseInput('{"nums":[0,0,0],"k":2,"maxChanges":1}'))
  assert.throws(() => parseInput('{"nums":[1,0],"k":4,"maxChanges":0}'))
})
