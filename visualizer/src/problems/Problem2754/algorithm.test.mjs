import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, EXAMPLES } from './algorithm.js'

test('2754 worked examples', () => {
  assert.equal(buildTrace(parseInput(EXAMPLES[0].input)).result, 'Ada says hi there')
  assert.equal(buildTrace(parseInput(EXAMPLES[1].input)).result, 'Bo says ok')
  assert.throws(() => parseInput('{"name":1,"args":[],"call":[]}'))
})
