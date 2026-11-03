import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2715 teaching model examples', () => {
  assert.equal(buildTrace(parseInput('{"delay":100,"cancelAt":40}')).result, 'cancelled')
  assert.equal(buildTrace(parseInput('{"delay":100,"cancelAt":150}')).result, 'fired')
  assert.equal(buildTrace(parseInput('{"delay":50,"cancelAt":null}')).result, 'fired')
})
