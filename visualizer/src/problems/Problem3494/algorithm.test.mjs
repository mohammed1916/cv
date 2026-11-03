import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (skill, mana) => buildTrace({ skill, mana }).result

test('3494 hand-checked schedules', () => {
  assert.equal(solve([2, 3, 1], [4, 2]), 28)
  assert.equal(solve([1, 1, 1], [1]), 3)
  assert.equal(solve([1, 2], [3, 1]), 11)
})

test('3494 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('{"skill":[],"mana":[1]}'))
  assert.throws(() => parseInput('{"skill":[1],"mana":[0]}'))
})
