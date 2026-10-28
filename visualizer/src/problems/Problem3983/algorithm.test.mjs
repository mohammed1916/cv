import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, t) => buildTrace({ s, t }).result

test('3983 official examples', () => {
  assert.equal(solve('cat', 'chat'), true)
  assert.equal(solve('plane', 'apple'), false)
})

test('3983 no replacement needed and a replacement at the ends', () => {
  assert.equal(solve('ab', 'xaxb'), true)
  // Replacing the first letter lets "zb" match inside "xb".
  assert.equal(solve('ab', 'xb'), true)
  // Two letters cannot both be fixed by one replacement.
  assert.equal(solve('abc', 'ca'), false)
})

test('3983 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab","t":"ab"}'))
})

// Independent oracle: try every position and every letter, then test subsequence directly.
function isSubsequence(a, b) {
  let k = 0
  for (const ch of b) if (k < a.length && a[k] === ch) k++
  return k === a.length
}

function oracle(s, t) {
  if (isSubsequence(s, t)) return true
  for (let i = 0; i < s.length; i++) {
    for (const c of 'abcdefghijklmnopqrstuvwxyz') {
      if (isSubsequence(s.slice(0, i) + c + s.slice(i + 1), t)) return true
    }
  }
  return false
}

test('3983 random strings match a brute-force oracle', () => {
  let seed = 3983
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 400; t++) {
    const s = word(1 + rnd(6))
    const tt = word(1 + rnd(8))
    assert.equal(solve(s, tt), oracle(s, tt), `${s} ${tt}`)
  }
})
