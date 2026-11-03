import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3458 three separate letter pairs give three blocks', () => {
  assert.equal(solve('aabbcc', 3), true)
  assert.equal(solve('aabbcc', 4), false)
})

test('3458 a whole-string block is not allowed', () => {
  assert.equal(solve('xyzx', 2), true)
  assert.equal(solve('xyzx', 3), false)
})

test('3458 zero blocks is always possible, and no block exists when letters repeat across the cut', () => {
  assert.equal(solve('pqrpqr', 0), true)
  assert.equal(solve('pqrpqr', 1), false)
})

test('3458 rejects k outside 0 to 26', () => {
  assert.throws(() => parseInput('{"s":"ab","k":27}'))
})
