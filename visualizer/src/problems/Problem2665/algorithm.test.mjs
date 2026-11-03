import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2665 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"init":5,"ops":["increment","decrement","reset","increment"]}')).result, [6, 5, 5, 6])
  assert.deepEqual(buildTrace(parseInput('{"init":-2,"ops":["decrement","decrement"]}')).result, [-3, -4])
  assert.deepEqual(buildTrace(parseInput('{"init":0,"ops":[]}')).result, [])
})
