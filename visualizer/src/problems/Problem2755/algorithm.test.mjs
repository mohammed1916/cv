import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2755 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, { x: 1, n: { p: 1, q: 5 }, y: [1] })
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, { list: [9] })
  assert.throws(() => parseInput('{"a":[],"b":{}}'))
})
