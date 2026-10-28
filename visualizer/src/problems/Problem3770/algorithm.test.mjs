import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('3770 official examples', () => {
  assert.equal(solve(20), 17)
  assert.equal(solve(2), 2)
})

test('3770 edge cases: below the first prime sum, and exactly a prime sum', () => {
  assert.equal(solve(1), 0)
  assert.equal(solve(5), 5)
})

test('3770 rejects n of zero', () => {
  assert.throws(() => parseInput('{"n":0}'))
})

// Independent oracle: sieve of Eratosthenes for primes up to n, then the largest prefix sum of those primes that is itself at most n and prime.
function oracle(n) {
  const sieve = Array(n + 1).fill(true)
  sieve[0] = false
  if (n >= 1) sieve[1] = false
  for (let i = 2; i * i <= n; i++) if (sieve[i]) for (let j = i * i; j <= n; j += i) sieve[j] = false
  let sum = 0
  let best = 0
  for (let p = 2; p <= n; p++) {
    if (!sieve[p]) continue
    sum += p
    if (sum > n) break
    if (sieve[sum]) best = sum
  }
  return best
}

test('3770 random values match a sieve oracle', () => {
  let seed = 3770
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(500) + 1
    assert.equal(solve(n), oracle(n), `n=${n}`)
  }
})
