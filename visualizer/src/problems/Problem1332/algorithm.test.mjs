import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('1332 sample inputs give the expected removal counts', () => {
  assert.equal(solve('aabbaa'), 1)
  assert.equal(solve('bbaaab'), 2)
  assert.equal(solve(''), 0)
})

test('1332 rejects malformed input', () => {
  assert.throws(() => parseInput('{"s":"abc"}'), /only the letters a and b/)
  assert.throws(() => parseInput('["ab"]'), /object/)
  assert.throws(() => parseInput(`{"s":"${'a'.repeat(21)}"}`), /20/)
})

// Independent oracle: the answer depends only on whether the string reads the same backwards.
test('1332 matches a reverse-comparison oracle on all strings up to length 8', () => {
  for (let length = 0; length <= 8; length++) {
    for (let mask = 0; mask < (1 << length); mask++) {
      let s = ''
      for (let i = 0; i < length; i++) s += (mask >> i) & 1 ? 'b' : 'a'
      const expected = s.length === 0 ? 0 : s === [...s].reverse().join('') ? 1 : 2
      assert.equal(solve(s), expected, s)
    }
  }
})
