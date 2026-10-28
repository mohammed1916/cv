import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('1163 examples', () => {
  assert.equal(solve('leetcode'), 'tcode')
  assert.equal(solve('abab'), 'bab')
})

test('1163 a single letter and a constant string', () => {
  assert.equal(solve('a'), 'a')
  assert.equal(solve('aaaa'), 'aaaa')
})

test('1163 rejects uppercase letters and empty input', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Independent oracle: compare every substring directly.
function oracle(s) {
  let best = ''
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const sub = s.slice(i, j)
      if (sub > best) best = sub
    }
  }
  return best
}

test('1163 random strings match an all-substrings oracle', () => {
  let seed = 1163
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(30)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abc'[rnd(3)]
    assert.equal(solve(s), oracle(s), s)
  }
})
