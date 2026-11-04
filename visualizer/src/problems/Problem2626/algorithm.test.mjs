import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2626 sum reducer folds left to right', () => {
  assert.equal(solve('{"nums":[1,2,3],"init":4}'), 10)
})

test('2626 squareSum reducer squares each element before adding', () => {
  assert.equal(solve('{"nums":[1,2,3],"init":4,"fn":"squareSum"}'), 18)
})

test('2626 an empty list returns the initial value', () => {
  assert.equal(solve('{"nums":[],"init":7}'), 7)
})

test('2626 rejects a number out of range', () => {
  assert.throws(() => parseInput('{"nums":[10],"init":0}'))
})

test('2626 rejects an unknown reducer', () => {
  assert.throws(() => parseInput('{"nums":[1],"init":0,"fn":"product"}'))
})
