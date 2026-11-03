import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2725 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, [0, 20, 40, 60])
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, [0])
  assert.throws(() => parseInput('{"periodMs":0,"cancelMs":5}'))
})
