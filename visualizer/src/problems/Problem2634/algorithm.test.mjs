import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2634 keeps values above their index', () => {
  assert.deepEqual(solve('{"arr":[0,10,20,30]}'), [10, 20, 30])
})

test('2634 equal value and index is dropped', () => {
  assert.deepEqual(solve('{"arr":[0,1,2]}'), [])
})

test('2634 rejects a value out of range', () => {
  assert.throws(() => parseInput('{"arr":[31]}'))
})
