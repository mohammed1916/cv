import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Independent oracle: build the reversed string and find the first index where the two strings agree.
function oracle(s) {
  const rev = s.split('').reverse().join('')
  for (let i = 0; i < s.length; i++) if (s[i] === rev[i]) return i
  return -1
}

test('3884 official examples', () => {
  assert.equal(solve('abcacbd'), 1)
  assert.equal(solve('abc'), 1)
  assert.equal(solve('abcdab'), -1)
})

test('3884 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

test('3884 random strings match the reversed-string oracle', () => {
  let seed = 3884
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(10) }, () => 'abcd'[rnd(4)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
