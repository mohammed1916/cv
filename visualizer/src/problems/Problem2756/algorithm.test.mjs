import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2756 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, [
    { status: 'fulfilled', value: 'a-done' },
    { status: 'rejected', reason: 'b' },
    { status: 'fulfilled', value: 'c-done' },
  ])
  assert.equal(buildTrace(parseInput(EXAMPLES[1].input)).result.length, 2)
  assert.throws(() => parseInput('[]'))
})
