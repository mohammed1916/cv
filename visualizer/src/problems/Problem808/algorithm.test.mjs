import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('808 n = 50 has the known value 0.625', () => {
  assert.ok(Math.abs(buildTrace(50).result - 0.625) < 1e-9)
})

test('808 very large soups tend to 1', () => {
  assert.ok(buildTrace(4800).result > 0.999)
  assert.equal(buildTrace(10000).result, 1)
})

test('808 rejects negative amounts', () => {
  assert.throws(() => parseInput('-1'))
})
