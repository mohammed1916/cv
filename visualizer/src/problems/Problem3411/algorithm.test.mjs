import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3411 official examples', () => {
  assert.equal(solve([1, 2, 1, 2, 1, 1, 1]), 5)
  assert.equal(solve([2, 3, 4, 5, 6]), 3)
})

test('3411 any two neighbors always qualify', () => {
  // For two values a and b, the product is a*b and lcm*gcd is also a*b.
  assert.equal(solve([7, 11]), 2)
  assert.equal(solve([4, 6, 9]), 2)
})

test('3411 rejects values outside 1 to 12', () => {
  assert.throws(() => parseInput('{"nums":[1,13]}'), /1 to 12/)
})

// Independent oracle: product equals lcm times gcd exactly when, for every prime, the exponent sum
// equals the largest exponent plus the smallest exponent. Values up to 12 only use primes 2, 3, 5, 7, 11.
const PRIMES = [2, 3, 5, 7, 11]
function exponent(value, p) {
  let count = 0
  for (let x = value; x % p === 0; x /= p) count++
  return count
}
function oracle(nums) {
  let best = 0
  for (let a = 0; a < nums.length; a++) {
    for (let b = a; b < nums.length; b++) {
      const window = nums.slice(a, b + 1)
      const ok = PRIMES.every(p => {
        const exps = window.map(v => exponent(v, p))
        return exps.reduce((s, e) => s + e, 0) === Math.max(...exps) + Math.min(...exps)
      })
      if (ok) best = Math.max(best, window.length)
    }
  }
  return best
}

test('3411 random arrays match a prime-exponent oracle', () => {
  let seed = 3411
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(12) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
