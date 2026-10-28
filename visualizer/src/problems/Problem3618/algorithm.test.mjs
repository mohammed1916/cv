import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3618 official examples', () => {
  assert.equal(solve([2, 3, 4]), 1)
  assert.equal(solve([-1, 5, 7, 0]), 3)
})

test('3618 a single element sits at index 0, which is not prime', () => {
  assert.equal(solve([9]), 9)
})

test('3618 rejects a non-integer and an oversized value', () => {
  assert.throws(() => parseInput('[1.5]'))
  assert.throws(() => parseInput('[1000000001]'))
})

// Independent oracle: mark prime indices with a sieve of Eratosthenes instead of trial division.
function oracle(nums) {
  const n = nums.length
  const composite = new Array(Math.max(n, 2)).fill(false)
  for (let p = 2; p * p < n; p++) if (!composite[p]) for (let q = p * p; q < n; q += p) composite[q] = true
  let a = 0
  let b = 0
  nums.forEach((v, i) => { if (i >= 2 && !composite[i]) a += v; else b += v })
  return Math.abs(a - b)
}

test('3618 random arrays match a sieve oracle', () => {
  let seed = 3618
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(20) }, () => rnd(101) - 50)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
