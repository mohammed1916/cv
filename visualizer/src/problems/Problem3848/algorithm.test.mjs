import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3848 a number whose digit factorial sum is itself', () => {
  assert.equal(solve(40585), true)
  assert.equal(solve(2), true)
})

test('3848 a number whose digit factorial sum has other digits', () => {
  assert.equal(solve(1234), false)
  assert.equal(solve(100), false)
})

test('3848 rejects zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})
