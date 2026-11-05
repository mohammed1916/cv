import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('804 Morse letter codes', () => {
  assert.equal(buildTrace(['a']).result, 1)
  assert.equal(buildTrace(['a', 'b']).result, 2)
  assert.equal(buildTrace(['ab', 'ba']).result, 2)
  assert.equal(buildTrace(['gin', 'zen']).result, 1)
})

test('804 repeats collapse to one representation', () => {
  assert.equal(buildTrace(['ab', 'ab', 'ab']).result, 1)
})

test('804 rejects uppercase letters', () => {
  assert.throws(() => parseInput('["Gin"]'))
})
