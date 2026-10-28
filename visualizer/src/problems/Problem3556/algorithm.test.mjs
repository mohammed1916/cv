import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3556 official examples', () => {
  assert.equal(solve('12234'), 1469)
  assert.equal(solve('111'), 11)
})

test('3556 no primes gives zero', () => {
  assert.equal(solve('0144'), 0)
})

test('3556 a repeated prime counts once', () => {
  assert.equal(solve('22'), 2 + 0)
})

test('3556 rejects a non-digit', () => {
  assert.throws(() => parseInput('{"s":"12a"}'))
})

// Independent oracle: sieve the primes up to 10^6, enumerate substrings the same way, and keep the three largest distinct primes.
function oracle(s) {
  const LIMIT = 1000000
  const composite = new Uint8Array(LIMIT + 1)
  for (let p = 2; p * p <= LIMIT; p++) if (!composite[p]) for (let q = p * p; q <= LIMIT; q += p) composite[q] = 1
  const primes = new Set()
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j <= s.length; j++) {
      const v = Number(s.slice(i, j))
      if (v >= 2 && v <= LIMIT && !composite[v]) primes.add(v)
    }
  }
  return [...primes].sort((a, b) => a - b).slice(-3).reduce((sum, v) => sum + v, 0)
}

test('3556 random digit strings match a sieve oracle', () => {
  let seed = 3556
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const len = 1 + rnd(6)
    const s = Array.from({ length: len }, () => String(rnd(10))).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
