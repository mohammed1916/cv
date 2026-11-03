import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2632 arguments are collected across calls until the arity is reached', () => {
  assert.equal(solve('{"arity":3,"calls":[[1],[2,3]]}'), 6)
})

test('2632 fires as soon as the arity is reached', () => {
  assert.equal(solve('{"arity":2,"calls":[[1],[2],[3]]}'), 3)
})

test('2632 stays pending when the calls run out', () => {
  assert.equal(solve('{"arity":2,"calls":[[1]]}'), null)
})
