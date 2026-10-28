import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('2405 official examples', () => {
  assert.equal(solve('abacaba'), 4)
  assert.equal(solve('ssssss'), 6)
})

test('2405 distinct letters need one piece', () => {
  assert.equal(solve('abcde'), 1)
})

test('2405 rejects uppercase letters', () => {
  assert.throws(() => parseInput(JSON.stringify({ s: 'Ab' })))
})

// Independent oracle: dynamic programming over prefixes, trying every last piece.
function oracle(s) {
  const best = new Array(s.length + 1).fill(Infinity)
  best[0] = 0
  for (let end = 1; end <= s.length; end++) {
    for (let begin = 0; begin < end; begin++) {
      const piece = s.slice(begin, end)
      if (new Set(piece).size !== piece.length) continue
      best[end] = Math.min(best[end], best[begin] + 1)
    }
  }
  return best[s.length]
}

test('2405 random strings match a dynamic-programming oracle', () => {
  let seed = 2405
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    let s = ''
    for (let i = 0; i < len; i++) s += 'abcde'[rnd(5)]
    assert.equal(solve(s), oracle(s), s)
  }
})
