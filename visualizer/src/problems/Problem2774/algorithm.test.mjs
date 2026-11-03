import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2774 worked examples', () => {
  assert.equal(buildTrace(parseInput(EXAMPLES[0].input)).result, 3)
  assert.equal(buildTrace(parseInput(EXAMPLES[1].input)).result, -1)
  assert.equal(buildTrace(parseInput('{"arr":[4],"target":4}')).result, 0)
  assert.throws(() => parseInput('{"arr":[2,1],"target":1}'))
})
