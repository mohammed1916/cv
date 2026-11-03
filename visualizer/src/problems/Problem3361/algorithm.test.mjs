import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('alternating a and b costs the backward walk for a and nothing for b', () => {
  const input = parseInput(JSON.stringify({ s: 'abab', t: 'baba', nextCost: [100, ...Array(25).fill(0)], previousCost: Array(26).fill(1) }))
  assert.equal(buildTrace(input).result, 50)
})

test('equal letters cost nothing and a single step uses the cheaper direction', () => {
  const input = parseInput(JSON.stringify({ s: 'ac', t: 'bc', nextCost: Array(26).fill(4), previousCost: Array(26).fill(9) }))
  assert.equal(buildTrace(input).result, 4)
})
