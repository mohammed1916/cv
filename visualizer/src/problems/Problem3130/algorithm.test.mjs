import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3130 hand-checked examples', () => {
  assert.equal(solve({ zero: 1, one: 1, limit: 2 }), 2)
  assert.equal(solve({ zero: 1, one: 2, limit: 1 }), 1)
  assert.equal(solve({ zero: 3, one: 3, limit: 2 }), 14)
})

test('3130 a limit at least as long as the array allows every arrangement', () => {
  // The array has 5 symbols, so no window exceeds limit 8 and every placement of the 2 zeros counts: C(5, 2) = 10.
  assert.equal(solve({ zero: 2, one: 3, limit: 8 }), 10)
})

test('3130 rejects a non-integer one', () => {
  assert.throws(() => parseInput('{"zero":1,"one":1.5,"limit":2}'))
})

// Independent oracle: try every placement of the ones and test each window longer than limit.
function oracle({ zero, one, limit }) {
  const n = zero + one
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    let ones = 0
    for (let b = mask; b; b &= b - 1) ones++
    if (ones !== one) continue
    const bits = Array.from({ length: n }, (_, i) => (mask >> i) & 1)
    let stable = true
    for (let a = 0; a < n && stable; a++) {
      for (let b = a + limit; b < n && stable; b++) {
        const window = bits.slice(a, b + 1)
        if (!window.includes(0) || !window.includes(1)) stable = false
      }
    }
    if (stable) count++
  }
  return count % MOD
}

test('3130 seeded random inputs match a brute-force enumeration', () => {
  let seed = 3130
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { zero: 1 + rnd(5), one: 1 + rnd(5), limit: 1 + rnd(4) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
