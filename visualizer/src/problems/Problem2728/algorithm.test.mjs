import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2728 worked examples', () => {
  assert.equal(buildTrace(parseInput(EXAMPLES[0].input)).result, 3)
  assert.equal(buildTrace(parseInput(EXAMPLES[1].input)).result, 0)
  assert.throws(() => parseInput('{"street":[0,2],"start":0}'))
})
