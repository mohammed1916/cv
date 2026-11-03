import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2775 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, { a: null, b: [1, null] })
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, { x: { y: { z: null } } })
})
