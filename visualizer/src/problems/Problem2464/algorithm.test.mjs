import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2464 worked examples', () => {
  assert.equal(solve([3, 5, 6]), 1)
  assert.equal(solve([2, 3, 5]), 3)
  assert.equal(solve([1, 2]), -1)
  assert.equal(solve([2, 6, 3, 4, 3]), 2)
  assert.equal(solve([1]), -1)
  assert.equal(solve([4]), 1)
})

test('2464 rejects out of range values', () => {
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[31]'))
})

// Oracle: try every way to cut the array into contiguous pieces and keep the best valid cut.
function oracle(nums) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b))
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let pieces = 0, start = 0, ok = true
    for (let k = 0; k < n; k++) {
      const cut = k === n - 1 || ((mask >> k) & 1)
      if (cut) {
        if (gcd(nums[start], nums[k]) <= 1) { ok = false; break }
        pieces++
        start = k + 1
      }
    }
    if (ok) best = Math.min(best, pieces)
  }
  return best === Infinity ? -1 : best
}

test('2464 random arrays match an exhaustive-cut oracle', () => {
  let seed = 2464
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
