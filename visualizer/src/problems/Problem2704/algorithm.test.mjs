import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2704 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"value":5,"checks":[["toBe",5],["notToBe",5],["toBe",6]]}')).result, ['true', 'throws', 'throws'])
  assert.deepEqual(buildTrace(parseInput('{"value":"a","checks":[["notToBe","b"]]}')).result, ['true'])
})
