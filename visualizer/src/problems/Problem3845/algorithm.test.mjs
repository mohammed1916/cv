import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3845 invented example', () => {
  assert.equal(solve([3, 6, 1, 4], 3), 6)
})

test('3845 equal values and isolated values', () => {
  assert.equal(solve([5, 5, 5], 0), 5)
  assert.equal(solve([2, 8], 0), 8)
})

test('3845 rejects a value outside the range', () => {
  assert.throws(() => parseInput('{"nums":[70],"k":1}'))
})
