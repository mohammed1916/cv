import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2726 worked examples', () => {
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[0].input)).result, { value: 10 })
  assert.deepEqual(buildTrace(parseInput(EXAMPLES[1].input)).result, { error: 'Division by zero' })
  assert.throws(() => parseInput('{"init":1,"ops":[["mod",2]]}'))
})
