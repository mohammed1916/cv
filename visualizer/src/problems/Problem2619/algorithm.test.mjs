import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2619 returns the final element', () => {
  assert.equal(solve('{"items":[1,2,3]}'), 3)
  assert.equal(solve('{"items":["a",2,null]}'), null)
})

test('2619 returns -1 for an empty array', () => {
  assert.equal(solve('{"items":[]}'), -1)
})

test('2619 rejects more than 10 values', () => {
  assert.throws(() => parseInput('{"items":[1,2,3,4,5,6,7,8,9,10,11]}'))
})
