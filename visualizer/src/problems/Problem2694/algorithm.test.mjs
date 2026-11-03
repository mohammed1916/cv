import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2694 teaching model examples', () => {
  const run = buildTrace(parseInput('{"script":[["subscribe","a","L1"],["subscribe","a","L2"],["emit","a"],["unsubscribe","a","L1"],["emit","a"]]}'))
  assert.deepEqual(run.result, [{ event: 'a', listeners: ['L1', 'L2'] }, { event: 'a', listeners: ['L2'] }])
})
