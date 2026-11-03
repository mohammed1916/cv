import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2692 teaching model examples', () => {
  const run = buildTrace(parseInput('{"obj":{"a":1,"b":{"c":[1,2]}},"write":["b","c"]}'))
  assert.equal(run.result.frozenCount, 3)
  assert.equal(run.result.blocked, true)
  assert.equal(buildTrace(parseInput('{"obj":{},"write":["x"]}')).result.frozenCount, 1)
})
