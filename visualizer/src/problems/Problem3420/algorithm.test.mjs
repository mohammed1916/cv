import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('a budget of one fixes the dip in [2, 1, 3] for every subarray', () => {
  const input = parseInput(JSON.stringify({ nums: [2, 1, 3], k: 1 }))
  assert.equal(buildTrace(input).result, 6)
})

test('a budget of zero leaves only already sorted subarrays', () => {
  const input = parseInput(JSON.stringify({ nums: [2, 1, 3], k: 0 }))
  assert.equal(buildTrace(input).result, 4)
})
