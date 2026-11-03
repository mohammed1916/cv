import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2622 overwrite of a live key returns true and the new value is read', () => {
  assert.deepEqual(solve('{"ops":[[0,"set","a",1,100],[40,"set","a",5,100],[60,"get","a"],[100,"get","a"],[100,"count"]]}'), [false, true, 5, 5, 1])
})

test('2622 an expired key is gone and not counted', () => {
  assert.deepEqual(solve('{"ops":[[0,"set","k",1,10],[10,"get","k"],[10,"count"]]}'), [false, -1, 0])
})

test('2622 rejects time moving backwards', () => {
  assert.throws(() => parseInput('{"ops":[[5,"count"],[3,"count"]]}'))
})
