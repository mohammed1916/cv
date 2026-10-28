import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2466 hand-checked examples', () => {
  assert.equal(solve({ low: 3, high: 3, zero: 1, one: 1 }), 8)
  // Length 2: "00" and "11". Length 3: "000", "011", "110".
  assert.equal(solve({ low: 2, high: 3, zero: 1, one: 2 }), 5)
})

test('2466 a single length counts its own strings', () => {
  assert.equal(solve({ low: 1, high: 1, zero: 1, one: 1 }), 2)
})

test('2466 rejects low above high', () => {
  assert.throws(() => parseInput('{"low":4,"high":3,"zero":1,"one":1}'))
})

// Independent oracle: breadth-first search over strings, appending a block of zeros or a block of ones.
function oracle({ low, high, zero, one }) {
  const all = new Set([''])
  let frontier = ['']
  while (frontier.length) {
    const next = []
    for (const s of frontier) {
      for (const block of ['0'.repeat(zero), '1'.repeat(one)]) {
        const t = s + block
        if (t.length <= high && !all.has(t)) {
          all.add(t)
          next.push(t)
        }
      }
    }
    frontier = next
  }
  return [...all].filter(s => s.length >= low).length % MOD
}

test('2466 seeded random inputs match a breadth-first search', () => {
  let seed = 2466
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const high = 1 + rnd(10)
    const input = { low: 1 + rnd(high), high, zero: 1 + rnd(3), one: 1 + rnd(3) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})

test('2466 the result is always below the modulus', () => {
  assert.ok(solve({ low: 1, high: 14, zero: 1, one: 1 }) < MOD)
})
