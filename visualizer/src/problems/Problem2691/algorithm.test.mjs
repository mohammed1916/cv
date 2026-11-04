import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('2691 teaching model examples', () => {
  const obj = { a: { b: 1, c: 2 }, d: 3 }
  const run = buildTrace(parseInput(JSON.stringify({ obj, writes: [[['a', 'b'], 9]] })))
  assert.deepEqual(run.result, { a: { b: 9, c: 2 }, d: 3 })
  assert.deepEqual(obj, { a: { b: 1, c: 2 }, d: 3 })
  assert.equal(run.result.d, obj.d)
})

test('2691 later writes build on earlier ones', () => {
  const run = buildTrace(parseInput('{"obj":{"x":5,"a":{"b":[1,2]}},"writes":[[["x"],6],[["a","b",1],9]]}'))
  assert.deepEqual(run.result, { x: 6, a: { b: [1, 9] } })
})
