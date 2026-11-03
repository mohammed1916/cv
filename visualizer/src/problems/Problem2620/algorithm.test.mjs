import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2620 counts up from the starting value', () => {
  assert.deepEqual(solve('{"init":10,"calls":3}'), [10, 11, 12])
})

test('2620 works with negative starts', () => {
  assert.deepEqual(solve('{"init":-2,"calls":4}'), [-2, -1, 0, 1])
})

test('2620 rejects zero calls', () => {
  assert.throws(() => parseInput('{"init":0,"calls":0}'))
})
