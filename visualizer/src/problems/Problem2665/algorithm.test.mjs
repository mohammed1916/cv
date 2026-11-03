import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2665 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"init":3,"ops":["increment","decrement","reset","increment"]}')).result, [4, 3, 3, 4])
  assert.deepEqual(buildTrace(parseInput('{"init":-2,"ops":["decrement","decrement"]}')).result, [-3, -4])
  assert.deepEqual(buildTrace(parseInput('{"init":0,"ops":[]}')).result, [])
})
