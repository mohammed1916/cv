import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = value => buildTrace(parseInput(JSON.stringify({ value }))).result

test('2633 nested values match the compact JSON text', () => {
  const value = { a: [1, true, null], b: 'hi there' }
  assert.equal(solve(value), JSON.stringify(value))
})

test('2633 a bare array and a bare number', () => {
  assert.equal(solve([3, 'ab']), JSON.stringify([3, 'ab']))
  assert.equal(solve(-7), '-7')
})

test('2633 rejects a fraction', () => {
  assert.throws(() => parseInput('{"value":1.5}'))
})
