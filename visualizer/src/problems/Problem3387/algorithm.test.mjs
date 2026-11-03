import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('a two-day round trip multiplies both legs', () => {
  const input = parseInput(JSON.stringify({ initialCurrency: 'AA', pairs1: [['AA', 'BB']], rates1: [2], pairs2: [['BB', 'AA']], rates2: [3] }))
  assert.ok(Math.abs(buildTrace(input).result - 6) < 1e-9)
})

test('with no useful conversion the amount stays at one', () => {
  const input = parseInput(JSON.stringify({ initialCurrency: 'AA', pairs1: [['BB', 'CC']], rates1: [2], pairs2: [['CC', 'DD']], rates2: [5] }))
  assert.ok(Math.abs(buildTrace(input).result - 1) < 1e-9)
})
