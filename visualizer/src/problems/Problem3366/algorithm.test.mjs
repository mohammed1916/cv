import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('one halving and one subtraction on three numbers', () => {
  const input = parseInput(JSON.stringify({ nums: [9, 4, 7], k: 3, op1: 1, op2: 1 }))
  assert.equal(buildTrace(input).result, 13)
})

test('no operations allowed keeps the original sum', () => {
  const input = parseInput(JSON.stringify({ nums: [5, 6], k: 2, op1: 0, op2: 0 }))
  assert.equal(buildTrace(input).result, 11)
})
