import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2629 the last function runs first', () => {
  assert.equal(solve('{"fns":["inc","dbl","sq"],"x":2}'), 9)
})

test('2629 an empty chain is the identity', () => {
  assert.equal(solve('{"fns":[],"x":5}'), 5)
})

test('2629 a single squared value', () => {
  assert.equal(solve('{"fns":["sq"],"x":-3}'), 9)
})
