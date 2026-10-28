import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3228 official examples', () => {
  assert.equal(solve('1001101'), 4)
  assert.equal(solve('00111'), 0)
  assert.equal(solve('10100'), 3)
})

test('3228 a single one before the end adds nothing', () => {
  assert.equal(solve('1'), 0)
  assert.equal(solve('10'), 1)
})

test('3228 rejects a character other than 0 or 1', () => {
  assert.throws(() => parseInput('{"s":"1021"}'))
})

// Independent oracle: longest chain of moves found by recursion on strings. A move takes a 1 that
// is directly followed by a 0 and slides it right to just before the next 1 (or the end).
function oracle(s, memo = new Map()) {
  if (memo.has(s)) return memo.get(s)
  let best = 0
  for (let i = 0; i + 1 < s.length; i++) {
    if (s[i] === '1' && s[i + 1] === '0') {
      let j = i + 1
      while (j + 1 < s.length && s[j + 1] === '0') j++
      const next = s.slice(0, i) + '0' + s.slice(i + 1, j) + '1' + s.slice(j + 1)
      best = Math.max(best, 1 + oracle(next, memo))
    }
  }
  memo.set(s, best)
  return best
}

test('3228 random strings match a longest-chain search', () => {
  let seed = 3228
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => (rnd(2) ? '1' : '0')).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
