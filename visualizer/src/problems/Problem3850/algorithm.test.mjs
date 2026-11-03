import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3850 invented example: skip, multiply and divide combinations', () => {
  assert.equal(solve([2, 5, 2], 5), 3)
})

test('3850 ones never change the value, so each has three choices', () => {
  assert.equal(solve([1, 1, 2], 1), 9)
})

test('3850 rejects numbers outside 1 to 6', () => {
  assert.throws(() => parseInput('{"nums":[7],"k":1}'))
})
