import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2776 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, { status: 'resolved', value: 42 })
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, { status: 'rejected', reason: 'boom' })
  assert.throws(() => parseInput('{"ok":true,"ms":3}'))
})
