import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2759 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, { a: [1, { b: 2 }], c: {} })
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, [1, [2, [3]]])
  assert.throws(() => parseInput('{"a":'))
})
