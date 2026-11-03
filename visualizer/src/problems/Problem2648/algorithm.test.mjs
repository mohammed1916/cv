import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2648 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"count":6}')).result, [0, 1, 1, 2, 3, 5])
  assert.deepEqual(buildTrace(parseInput('{"count":0}')).result, [])
  assert.equal(buildTrace(parseInput('{"count":1}')).frames.at(-1).phase, 'done')
})
