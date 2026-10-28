import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3591 worked examples', () => {
  assert.equal(solve([1, 2, 2, 2]), true)
  assert.equal(solve([1, 1, 2, 2]), true)
  assert.equal(solve([1, 2, 3]), false)
  assert.equal(solve([5, 5, 5, 5]), false)
})

test('3591 a single element has frequency one, which is not prime', () => {
  assert.equal(solve([42]), false)
})

test('3591 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
  assert.throws(() => parseInput('{"nums":[101]}'))
})

// Independent oracle: a sieve of primes up to the array length, and a filter count per value.
function oracle(nums) {
  const primeAt = []
  for (let n = 0; n <= nums.length; n++) primeAt[n] = n >= 2 && [...Array(n).keys()].slice(2).every(d => n % d !== 0)
  return nums.some(v => primeAt[nums.filter(x => x === v).length])
}

test('3591 random arrays match a sieve oracle', () => {
  let seed = 3591
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const spread = 1 + rnd(8)
    const nums = Array.from({ length: 1 + rnd(20) }, () => 1 + rnd(spread))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
