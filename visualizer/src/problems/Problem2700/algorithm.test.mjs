import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2700 teaching model examples', () => {
  const run = buildTrace(parseInput('{"obj1":{"a":1,"n":{"x":2,"y":[1]}},"obj2":{"a":1,"n":{"x":5,"y":[1]}}}'))
  assert.deepEqual(run.result, { 'n.x': [2, 5] })
  assert.deepEqual(buildTrace(parseInput('{"obj1":{},"obj2":{"k":null}}')).result, { k: [undefined, null] })
})
