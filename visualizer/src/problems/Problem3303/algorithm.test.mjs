import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, pattern) => buildTrace({ s, pattern }).result

test('3303 official examples', () => {
  assert.equal(solve('abcdefg', 'bcdffg'), 1)
  assert.equal(solve('ababbababa', 'bacaba'), 4)
  assert.equal(solve('abcd', 'dba'), -1)
  assert.equal(solve('dde', 'd'), 0)
})

test('3303 an exact match at the start is found first', () => {
  assert.equal(solve('abab', 'ab'), 0)
})

test('3303 rejects a pattern as long as s', () => {
  assert.throws(() => parseInput('{"s":"abc","pattern":"abc"}'))
})

// Independent oracle: a window is almost equal when it equals the pattern or becomes equal to it
// after one character is replaced. This enumerates the replacements instead of counting mismatches.
function oracle(s, pattern) {
  const m = pattern.length
  for (let i = 0; i + m <= s.length; i++) {
    const w = s.slice(i, i + m)
    let ok = w === pattern
    for (let p = 0; p < m && !ok; p++) {
      for (const c of 'abc') {
        if (w.slice(0, p) + c + w.slice(p + 1) === pattern) { ok = true; break }
      }
    }
    if (ok) return i
  }
  return -1
}

test('3303 random strings match a replacement-enumerating oracle', () => {
  let seed = 3303
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const s = word(2 + rnd(11))
    const pattern = word(1 + rnd(s.length - 1))
    assert.equal(solve(s, pattern), oracle(s, pattern), `${s} ${pattern}`)
  }
})
