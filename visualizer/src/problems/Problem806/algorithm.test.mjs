import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('806 ten-pixel letters fill lines of ten', () => {
  const widths = Array(26).fill(10)
  assert.deepEqual(buildTrace({ widths, s: 'abcdefghij' }).result, [1, 100])
  assert.deepEqual(buildTrace({ widths, s: 'abcdefghijk' }).result, [2, 10])
})

test('806 total width splits into ceil(total / 100) lines when every letter is narrow', () => {
  const widths = Array(26).fill(2)
  for (let n = 1; n <= 100; n++) {
    const s = 'a'.repeat(n)
    const [lines, last] = buildTrace({ widths, s }).result
    const perLine = 50
    assert.equal(lines, Math.ceil(n / perLine))
    assert.equal(last, (n - (lines - 1) * perLine) * 2)
  }
})

test('806 rejects a width of 1', () => {
  assert.throws(() => parseInput(JSON.stringify({ widths: Array(26).fill(1), s: 'a' })))
})
