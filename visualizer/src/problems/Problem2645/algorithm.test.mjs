import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = word => buildTrace(parseInput(JSON.stringify({ word }))).result

// Independent oracle: try every number m of "abc" blocks; the word must be a subsequence of abc repeated m times.
function oracle(word) {
  let best = Infinity
  for (let m = 0; m <= 2 * word.length + 2; m++) {
    const big = 'abc'.repeat(m)
    let p = 0
    for (const ch of big) if (p < word.length && word[p] === ch) p++
    if (p === word.length) best = Math.min(best, 3 * m - word.length)
  }
  return best
}

test('2645 examples', () => {
  assert.equal(solve('abc'), 0)
  assert.equal(solve('aabcbc'), 3)
  assert.equal(solve('abcabcababcc'), 3)
})

test('2645 rejects letters outside a to c', () => {
  assert.throws(() => parseInput('{"word":"abd"}'))
})

test('2645 random words match a subsequence oracle', () => {
  let seed = 2645
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(12) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(word), oracle(word), word)
  }
})
