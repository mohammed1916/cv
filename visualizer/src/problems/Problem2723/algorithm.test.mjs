import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2723 worked examples', () => {
  assert.equal(buildTrace(parseInput(EXAMPLES[0].input)).result, 7)
  assert.equal(buildTrace(parseInput(EXAMPLES[1].input)).result, 5)
  assert.throws(() => parseInput('{"a":1.5,"b":2,"aMs":0,"bMs":0}'))
})
