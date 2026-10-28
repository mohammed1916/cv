import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('2272 official examples', () => {
  assert.equal(solve('aababbb'), 3)
  assert.equal(solve('abcde'), 0)
})

test('2272 small cases', () => {
  assert.equal(solve('a'), 0)
  assert.equal(solve('aab'), 1)
  // "bbba" has three b and one a, so the whole string has variance 2.
  assert.equal(solve('bbba'), 2)
})

test('2272 rejects bad input', () => {
  assert.throws(() => parseInput('{"s": "AB"}'), /lowercase/)
  assert.throws(() => parseInput('{"s": ""}'), /lowercase/)
  assert.throws(() => parseInput('{"t": "ab"}'), /one key/)
})

// Independent oracle: take every substring and compare its most and least frequent letters.
function oracle(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const counts = new Map()
      for (const c of s.slice(i, j)) counts.set(c, (counts.get(c) || 0) + 1)
      const values = [...counts.values()]
      best = Math.max(best, Math.max(...values) - Math.min(...values))
    }
  }
  return best
}

test('2272 random strings match a substring-by-substring oracle', () => {
  let seed = 2272
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
