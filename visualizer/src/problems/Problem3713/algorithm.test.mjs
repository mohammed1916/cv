import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('3713 worked examples', () => {
  assert.equal(solve('abba'), 4)
  assert.equal(solve('abbac'), 4)
  assert.equal(solve('a'), 1)
  assert.equal(solve('abc'), 3)
  assert.equal(solve('aabb'), 4)
})

test('3713 rejects non-letter input', () => {
  assert.throws(() => parseInput('{"s":"AB"}'))
  assert.throws(() => parseInput('{"s":""}'))
})

// Brute-force oracle: test every substring from scratch.
function oracle(s) {
  let best = 0
  for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
    const counts = {}
    for (const c of s.slice(i, j + 1)) counts[c] = (counts[c] || 0) + 1
    const vals = new Set(Object.values(counts))
    if (vals.size === 1) best = Math.max(best, j - i + 1)
  }
  return best
}

test('3713 random strings match a from-scratch oracle', () => {
  let seed = 3713
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 1 + rnd(12) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
