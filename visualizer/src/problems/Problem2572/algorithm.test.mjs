import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2572 official examples', () => {
  assert.equal(solve([3, 4, 4, 5]), 3)
  assert.equal(solve([1]), 1)
  assert.equal(solve([1, 1, 1]), 7)
})

test('2572 a square factor disqualifies a number', () => {
  assert.equal(solve([4]), 0)
  assert.equal(solve([4, 2]), 1)
})

test('2572 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[31]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: test every subset directly by summing prime exponents, with no bitmasks.
function oracle(nums) {
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
  const exponent = (x, p) => { let e = 0; while (x % p === 0) { x /= p; e++ } return e }
  let count = 0
  for (let s = 1; s < 1 << nums.length; s++) {
    const chosen = nums.filter((_, i) => s & (1 << i))
    if (primes.every(p => chosen.reduce((sum, x) => sum + exponent(x, p), 0) <= 1)) count++
  }
  return count % 1000000007
}

test('2572 random arrays match the exponent-sum oracle', () => {
  let seed = 2572
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
