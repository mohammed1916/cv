import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2636 a pool of two refills as tasks finish', () => {
  assert.equal(solve('{"limit":2,"durations":[300,100,200,50]}'), 350)
})

test('2636 a pool of one runs tasks in turn', () => {
  assert.equal(solve('{"limit":1,"durations":[10,20]}'), 30)
})

test('2636 a wide pool is limited by the longest task', () => {
  assert.equal(solve('{"limit":3,"durations":[5,7]}'), 7)
  assert.equal(solve('{"limit":2,"durations":[]}'), 0)
})
