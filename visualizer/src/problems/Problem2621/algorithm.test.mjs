import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2621 completion follows the delays', () => {
  assert.deepEqual(solve('{"durations":[300,100,200]}'), [1, 2, 0])
})

test('2621 equal delays keep their start order', () => {
  assert.deepEqual(solve('{"durations":[50,50,10]}'), [2, 0, 1])
})

test('2621 rejects a negative delay', () => {
  assert.throws(() => parseInput('{"durations":[-1]}'))
})
