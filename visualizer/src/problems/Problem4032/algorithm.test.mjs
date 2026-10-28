import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('4032 official examples', () => {
  assert.equal(solve([7, 6, 10, 12, 11], 3), 3)
  assert.equal(solve([4, 6, 9, 18], 4), 4)
  assert.equal(solve([6, 10, 15], 2), 1)
})

test('4032 returns 0 when no element fits', () => {
  // 30 = 2 * 3 * 5 has three distinct primes, more than k = 1.
  assert.equal(solve([30], 1), 0)
})

test('4032 rejects k of 0', () => {
  assert.throws(() => parseInput('{"nums":[4],"k":0}'))
})

// Independent oracle: check every subarray by collecting the union of its distinct primes.
function primeSet(x) {
  const out = new Set()
  for (let d = 2; d <= x; d++) {
    if (x % d === 0) {
      out.add(d)
      while (x % d === 0) x /= d
    }
  }
  return out
}

function oracle(nums, k) {
  let best = 0
  for (let l = 0; l < nums.length; l++) {
    const union = new Set()
    for (let r = l; r < nums.length; r++) {
      for (const p of primeSet(nums[r])) union.add(p)
      if (union.size <= k) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('4032 random arrays match an all-subarrays oracle', () => {
  let seed = 4032
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const pool = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 30, 42, 60]
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => pool[rnd(pool.length)])
    const k = 1 + rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
