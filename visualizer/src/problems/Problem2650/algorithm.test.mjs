import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2650 a cancel before the next step ends rejects with Cancelled', () => {
  assert.equal(buildTrace(parseInput('{"steps":[20,30,50,10],"cancelAt":60}')).result, 'Cancelled')
})

test('2650 a job that finishes before the cancel resolves with its return value', () => {
  assert.equal(buildTrace(parseInput('{"steps":[20,30],"cancelAt":50}')).result, 50)
})

test('2650 the finished steps are recorded before the cancel point', () => {
  assert.deepEqual(buildTrace(parseInput('{"steps":[20,30,50],"cancelAt":60}')).frames.at(-2).done, [20, 50])
})

test('2650 rejects a zero step duration', () => {
  assert.throws(() => parseInput('{"steps":[0],"cancelAt":5}'))
})
