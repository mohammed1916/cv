import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2627 a burst runs once after its last call', () => {
  assert.deepEqual(solve('{"wait":100,"calls":[0,50,120,300]}'), [220, 400])
})

test('2627 equal times collapse into one run', () => {
  assert.deepEqual(solve('{"wait":5,"calls":[10,10,10]}'), [15])
})

test('2627 calls must be in order', () => {
  assert.throws(() => parseInput('{"wait":5,"calls":[10,3]}'))
})
