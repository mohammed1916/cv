import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3870 invented size with one comma group', () => {
  assert.equal(solve(12345), 11346)
})

test('3870 the top of the range gets one comma per number from a thousand up', () => {
  assert.equal(solve(99999), 99000)
})

test('3870 numbers under a thousand have no commas', () => {
  assert.equal(solve(999), 0)
})

test('3870 rejects zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})
