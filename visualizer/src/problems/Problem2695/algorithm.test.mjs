import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2695 teaching model examples', () => {
  assert.equal(buildTrace(parseInput('{"a":[1,2],"b":[3]}')).result, 6)
  assert.equal(buildTrace(parseInput('{"a":[],"b":[-4,1]}')).result, -3)
})
