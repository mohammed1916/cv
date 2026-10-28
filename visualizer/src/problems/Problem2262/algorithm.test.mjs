import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('2262 official examples', () => {
  assert.equal(solve('abbca'), 28)
  assert.equal(solve('code'), 20)
})

test('2262 repeated letters and a single letter', () => {
  assert.equal(solve('a'), 1)
  // Substrings: three "a" (1 each), two "aa" (1 each), one "aaa" (1).
  assert.equal(solve('aaa'), 6)
})

test('2262 rejects bad input', () => {
  assert.throws(() => parseInput('{"s": "ABC"}'), /lowercase/)
  assert.throws(() => parseInput('{"s": ""}'), /lowercase/)
  assert.throws(() => parseInput('{"s": "ab", "t": 1}'), /one key/)
})

// Independent oracle: enumerate every substring and count its distinct letters with a Set.
function oracle(s) {
  let total = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) total += new Set(s.slice(i, j)).size
  }
  return total
}

test('2262 random strings match a substring-by-substring oracle', () => {
  let seed = 2262
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcd'[rnd(4)]
    assert.equal(solve(s), oracle(s), s)
  }
})
