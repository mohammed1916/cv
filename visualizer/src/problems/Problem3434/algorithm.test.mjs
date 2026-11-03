import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('turning the 2..6 block toward 1 gains one copy of 1', () => {
  const input = parseInput(JSON.stringify({ nums: [1, 2, 3, 4, 5, 6], k: 1 }))
  assert.equal(buildTrace(input).result, 2)
})

test('when k is already everywhere the frequency is the length', () => {
  const input = parseInput(JSON.stringify({ nums: [2, 2, 2], k: 2 }))
  assert.equal(buildTrace(input).result, 3)
})
