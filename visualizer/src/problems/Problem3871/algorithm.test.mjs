import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3871 invented large size with two comma groups', () => {
  assert.equal(solve(987654321), 1974307644)
})

test('3871 a million has two commas inside the range', () => {
  assert.equal(solve(1000000), 999002)
})

test('3871 a value beyond the limit is refused', () => {
  assert.throws(() => parseInput('{"n":1000000000000001}'))
})
