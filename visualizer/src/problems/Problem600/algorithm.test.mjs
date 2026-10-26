import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('600 official examples', () => {
  assert.equal(buildTrace(5).result, 5)
  assert.equal(buildTrace(1).result, 2)
  assert.equal(buildTrace(2).result, 3)
})

test('600 every n up to 3000 matches a direct bit-test count', () => {
  const ok = n => (n & (n >> 1)) === 0
  let expected = 0
  for (let n = 0; n <= 3000; n++) {
    if (ok(n)) expected++
    assert.equal(buildTrace(n).result, expected, `n=${n}`)
  }
})

test('600 rejects negative values', () => {
  assert.throws(() => parseInput('-1'))
})
