import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

// Independent oracle: dynamic programming over positions, where the state is the letter chosen at each position.
function oracle(word) {
  let dp = Array.from({ length: 26 }, (_, c) => (c === word.charCodeAt(0) - 97 ? 0 : 1))
  for (let i = 1; i < word.length; i++) {
    const want = word.charCodeAt(i) - 97
    const next = Array(26).fill(Infinity)
    for (let c = 0; c < 26; c++) {
      const cost = c === want ? 0 : 1
      for (let d = 0; d < 26; d++) {
        if (Math.abs(c - d) <= 1) continue
        next[c] = Math.min(next[c], dp[d] + cost)
      }
    }
    dp = next
  }
  return Math.min(...dp)
}

test('2957 examples', () => {
  assert.equal(solve('aaaaa'), 2)
  assert.equal(solve('abddez'), 2)
  assert.equal(solve('zyxyxyz'), 3)
})

test('2957 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"word":"Ab"}'))
})

test('2957 random words match a letter-choice dynamic programme', () => {
  let seed = 2957
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(12) }, () => String.fromCharCode(97 + rnd(4))).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
