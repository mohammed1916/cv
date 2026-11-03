import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2676 teaching model examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"wait":100,"calls":[0,40,90,150,260]}')).result, [0, 100, 200, 300])
  assert.deepEqual(buildTrace(parseInput('{"wait":50,"calls":[]}')).result, [])
  assert.deepEqual(buildTrace(parseInput('{"wait":50,"calls":[10,70]}')).result, [10, 70])
})
