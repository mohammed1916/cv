import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(s).result

test('1392 official examples', () => {
  assert.equal(solve('level'), 'l')
  assert.equal(solve('ababab'), 'abab')
  assert.equal(solve('leetcodeleet'), 'leet')
  assert.equal(solve('a'), '')
})

test('1392 a border that falls back through a shorter border', () => {
  // "aaaa" borders grow 1, 2, 3; "abaab" needs the fallback from k=2 to k=1.
  assert.equal(solve('aaaa'), 'aaa')
  assert.equal(solve('abaab'), 'ab')
})

test('1392 rejects non-strings and characters outside a to z', () => {
  assert.throws(() => parseInput('[1,2]'))
  assert.throws(() => parseInput('"AB"'))
  assert.throws(() => parseInput('""'))
})

// Independent oracle: try every proper prefix length from longest to shortest.
function oracle(s) {
  for (let len = s.length - 1; len >= 1; len--) {
    if (s.slice(0, len) === s.slice(s.length - len)) return s.slice(0, len)
  }
  return ''
}

test('1392 random strings match a brute-force border oracle', () => {
  let seed = 977
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const length = 1 + rnd(14)
    let s = ''
    for (let i = 0; i < length; i++) s += 'ab'[rnd(2)]
    assert.equal(solve(s), oracle(s), s)
  }
})
