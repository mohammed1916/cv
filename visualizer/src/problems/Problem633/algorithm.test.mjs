import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('633 official examples', () => {
  assert.equal(buildTrace(5).result, true)
  assert.equal(buildTrace(3).result, false)
  assert.equal(buildTrace(0).result, true)
})

test('633 every c up to 2000 matches a double loop over a and b', () => {
  const sums = new Set()
  for (let a = 0; a * a <= 2000; a++) for (let b = 0; a * a + b * b <= 2000; b++) sums.add(a * a + b * b)
  for (let c = 0; c <= 2000; c++) assert.equal(buildTrace(c).result, sums.has(c), `c=${c}`)
})

test('633 rejects negative values', () => {
  assert.throws(() => parseInput('-1'))
})
