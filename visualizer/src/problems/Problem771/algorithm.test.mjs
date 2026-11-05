import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('771 counts stones whose letter is a jewel', () => {
  assert.equal(buildTrace({ jewels: 'aA', stones: 'aAAbbbb' }).result, 3)
  assert.equal(buildTrace({ jewels: 'z', stones: 'ZZ' }).result, 0)
})

test('771 rejects repeated jewel types', () => {
  assert.throws(() => parseInput('{"jewels":"aa","stones":"a"}'))
})
