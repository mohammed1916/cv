import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3090 official examples', () => {
  assert.equal(solve('bcbbbcba'), 4)
  assert.equal(solve('aaaa'), 2)
})

test('3090 all distinct letters keep the whole string', () => {
  assert.equal(solve('abcdef'), 6)
})

test('3090 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

// Independent oracle: test every substring for letters appearing more than twice.
function oracle(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    for (let j = i; j < s.length; j++) {
      const sub = s.slice(i, j + 1)
      const ok = [...new Set(sub)].every(ch => sub.split(ch).length - 1 <= 2)
      if (ok) best = Math.max(best, sub.length)
    }
  }
  return best
}

test('3090 random strings match a substring oracle', () => {
  let seed = 3090
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    let s = ''
    const len = 1 + rnd(18)
    for (let k = 0; k < len; k++) s += 'abcd'[rnd(4)]
    assert.equal(solve(s), oracle(s), s)
  }
})
