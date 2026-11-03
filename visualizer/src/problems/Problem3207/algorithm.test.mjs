import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (enemies, energy) => buildTrace({ enemies, energy }).result

test('3207 hand-checked cases', () => {
  assert.equal(solve([4, 6, 1], 5), 15)
  assert.equal(solve([8, 3, 5], 9), 7)
  assert.equal(solve([7, 8], 1), 0)
  assert.equal(solve([5, 1, 4], 4), 13)
})

test('3207 rejects bad input', () => {
  assert.throws(() => parseInput('{"enemies":[],"energy":1}'))
  assert.throws(() => parseInput('{"enemies":[1],"energy":-1}'))
})
