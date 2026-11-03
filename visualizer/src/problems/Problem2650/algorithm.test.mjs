import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2650 teaching model examples', () => {
  assert.equal(buildTrace(parseInput('{"steps":[20,30,50,10],"cancelAt":60}')).result, 'cancelled')
  assert.equal(buildTrace(parseInput('{"steps":[20,30],"cancelAt":50}')).result, 'finished')
  assert.deepEqual(buildTrace(parseInput('{"steps":[20,30,50],"cancelAt":60}')).frames.at(-2).done, [20, 50])
})
