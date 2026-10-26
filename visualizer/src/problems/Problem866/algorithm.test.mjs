import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result

// Oracle: walk upward from n testing palindrome-ness by string reversal, then primality.
function oracle(n) {
  for (let x = n; ; x++) {
    const s = String(x)
    if (s !== [...s].reverse().join('')) continue
    if (x < 2) continue
    let prime = true
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break }
    if (prime) return x
  }
}

test('official examples', () => {
  assert.equal(solve(6), 7); assert.equal(solve(8), 11); assert.equal(solve(13), 101)
})

test('large values', () => {
  assert.equal(solve(9989900), 100030001)
  assert.equal(solve(100000000), 100030001)
})

test('matches linear scan on small and random n', () => {
  for (let n = 1; n <= 3000; n++) assert.equal(solve(n), oracle(n), String(n))
  for (let t = 0; t < 60; t++) { const n = 3000 + Math.floor(Math.random() * 3000000); assert.equal(solve(n), oracle(n), String(n)) }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('13'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('0'))
  assert.throws(() => parseInput('1.5'))
  assert.throws(() => parseInput('"7"'))
  assert.throws(() => parseInput('100000001'))
})
