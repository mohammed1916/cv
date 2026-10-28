import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3922 official examples', () => {
  assert.equal(solve('1010'), 1)
  assert.equal(solve('0110'), 1)
  assert.equal(solve('1000'), 0)
})

test('3922 a single character and an all-ones string', () => {
  assert.equal(solve('1'), 0)
  // 111 has no 0, so neither pattern can appear. 110 needs one flip, since 010 is coherent.
  assert.equal(solve('111'), 0)
  assert.equal(solve('110'), 1)
})

test('3922 rejects a non-binary string', () => {
  assert.throws(() => parseInput('{"s":"012"}'))
})

// Independent oracle: try every set of flips and test forbidden subsequences by checking index triples.
function containsSubsequence(s, pattern) {
  const n = s.length
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
    if (s[i] === pattern[0] && s[j] === pattern[1] && s[k] === pattern[2]) return true
  }
  return false
}

function oracle(s) {
  const n = s.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let t = ''
    let flips = 0
    for (let i = 0; i < n; i++) {
      const bit = (mask >> i) & 1
      if (bit) flips++
      t += bit ? (s[i] === '0' ? '1' : '0') : s[i]
    }
    if (!containsSubsequence(t, '011') && !containsSubsequence(t, '110')) best = Math.min(best, flips)
  }
  return best
}

test('3922 random strings match an exhaustive flip oracle', () => {
  let seed = 3922
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(10)
    let s = ''
    for (let i = 0; i < len; i++) s += rnd(2) ? '1' : '0'
    assert.equal(solve(s), oracle(s), s)
  }
})
