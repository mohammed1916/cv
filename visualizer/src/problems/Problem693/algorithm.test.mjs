import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('693 official examples', () => {
  assert.equal(buildTrace(5).result, true)
  assert.equal(buildTrace(7).result, false)
  assert.equal(buildTrace(11).result, false)
})

test('693 every n up to 4096 matches the XOR-with-shift test', () => {
  for (let n = 1; n <= 4096; n++) {
    const x = n ^ (n >> 1)
    assert.equal(buildTrace(n).result, (x & (x + 1)) === 0, `n=${n}`)
  }
})

test('693 rejects zero', () => {
  assert.throws(() => parseInput('0'))
})
