import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('717 official examples', () => {
  assert.equal(buildTrace([1, 0, 0]).result, true)
  assert.equal(buildTrace([1, 1, 1, 0]).result, false)
})

// Oracle: build valid encodings from the tokens 0, 10, 11; the last character is one bit exactly when the last token is 0.
test('717 every encoding built from tokens 0, 10, 11 is classified by its last token', () => {
  const tokens = ['0', '10', '11']
  function visit(s, lastToken) {
    if (s.length) assert.equal(buildTrace([...s].map(Number)).result, lastToken === '0', s)
    if (s.length < 8) for (const t of tokens) visit(s + t, t)
  }
  visit('', null)
})

test('717 rejects non-bit values', () => {
  assert.throws(() => parseInput('[2]'))
})
