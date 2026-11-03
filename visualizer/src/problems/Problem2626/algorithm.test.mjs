import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2626 folds left to right', () => {
  assert.equal(solve('{"nums":[1,2,3],"init":4}'), 43)
})

test('2626 an empty list returns the initial value', () => {
  assert.equal(solve('{"nums":[],"init":7}'), 7)
})

test('2626 rejects a number out of range', () => {
  assert.throws(() => parseInput('{"nums":[10],"init":0}'))
})
