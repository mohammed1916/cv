import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, m) => buildTrace(parseInput(JSON.stringify({ nums, k, m }))).result

test('3859 invented example with two distinct values', () => {
  assert.equal(solve([4, 4, 1, 4, 1], 2, 2), 2)
})

test('3859 a single repeated value', () => {
  assert.equal(solve([1, 1, 1], 1, 2), 3)
  assert.equal(solve([1, 1, 1], 1, 3), 1)
})

test('3859 rejects k outside 1 to 9', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0,"m":1}'))
})
