import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2691 teaching model examples', () => {
  const input = { state: { a: { b: 1, c: 2 }, d: 3 }, path: ['a', 'b'], value: 9 }
  const run = buildTrace(parseInput(JSON.stringify(input)))
  assert.deepEqual(run.result, { a: { b: 9, c: 2 }, d: 3 })
  assert.deepEqual(input.state, { a: { b: 1, c: 2 }, d: 3 })
  assert.equal(run.result.d, input.state.d)
})
