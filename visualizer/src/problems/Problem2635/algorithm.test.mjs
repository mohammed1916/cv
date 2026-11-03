import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2635 transforms each value with its index', () => {
  assert.deepEqual(solve('{"arr":[5,0,4]}'), [10, 1, 10])
})

test('2635 an empty array maps to an empty array', () => {
  assert.deepEqual(solve('{"arr":[]}'), [])
})

test('2635 negative values work', () => {
  assert.deepEqual(solve('{"arr":[-1]}'), [-2])
})
