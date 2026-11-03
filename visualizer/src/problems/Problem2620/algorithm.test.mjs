import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2620 counts up from the starting value', () => {
  assert.deepEqual(solve('{"init":7,"calls":4}'), [7, 8, 9, 10])
})

test('2620 works with negative starts', () => {
  assert.deepEqual(solve('{"init":-5,"calls":3}'), [-5, -4, -3])
})

test('2620 rejects zero calls', () => {
  assert.throws(() => parseInput('{"init":0,"calls":0}'))
})
