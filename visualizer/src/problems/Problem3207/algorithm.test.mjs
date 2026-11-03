import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (enemies, energy) => buildTrace({ enemies, energy }).result

test('3207 hand-checked cases', () => {
  assert.equal(solve([2, 2, 3], 2), 3)
  assert.equal(solve([2], 10), 5)
  assert.equal(solve([7, 8], 1), 0)
  assert.equal(solve([5, 1, 4], 4), 13)
})

test('3207 rejects bad input', () => {
  assert.throws(() => parseInput('{"enemies":[],"energy":1}'))
  assert.throws(() => parseInput('{"enemies":[1],"energy":-1}'))
})
