import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('a block that lifts the 8 and 2 toward 4 gains one copy of 4', () => {
  const input = parseInput(JSON.stringify({ nums: [4, 8, 4, 2, 7, 4], k: 4 }))
  assert.equal(buildTrace(input).result, 4)
})

test('when k is already everywhere the frequency is the length', () => {
  const input = parseInput(JSON.stringify({ nums: [2, 2, 2], k: 2 }))
  assert.equal(buildTrace(input).result, 3)
})
