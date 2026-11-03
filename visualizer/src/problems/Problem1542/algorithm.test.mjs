import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(s)).result

test('1542 sample inputs give the expected lengths', () => {
  assert.equal(solve('1221'), 4)
  assert.equal(solve('2024'), 3)
  assert.equal(solve('0123'), 1)
  assert.equal(solve('7'), 1)
})

test('1542 rejects malformed input', () => {
  assert.throws(() => parseInput('12a'), /digits/)
  assert.throws(() => parseInput(''), /digits/)
})

// Brute-force oracle: every substring, count digits with odd occurrences.
function brute(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) {
    const counts = new Array(10).fill(0)
    let odd = 0
    for (let j = i; j < s.length; j++) {
      const d = Number(s[j])
      counts[d] ^= 1
      odd += counts[d] ? 1 : -1
      if (odd <= 1) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('1542 random digit strings match a brute-force oracle', () => {
  let seed = 9
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(25)
    const s = Array.from({ length: len }, () => String(rnd(4))).join('')
    assert.equal(solve(s), brute(s), s)
  }
})
