import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('2939 official examples', () => {
  assert.equal(solve({ a: 12, b: 5, n: 4 }), 98)
  assert.equal(solve({ a: 6, b: 7, n: 5 }), 930)
  assert.equal(solve({ a: 1, b: 6, n: 3 }), 12)
})

test('2939 rejects n above the visualization cap', () => {
  assert.throws(() => parseInput('{"a":1,"b":2,"n":9}'))
})

// Independent oracle: try every x below 2^n with exact integers, then reduce the best product modulo 1e9+7.
function oracle({ a, b, n }) {
  let best = -1n
  for (let x = 0; x < 1 << n; x++) {
    const product = BigInt(a ^ x) * BigInt(b ^ x)
    if (product > best) best = product
  }
  return Number(best % 1000000007n)
}

test('2939 random inputs match the exhaustive oracle', () => {
  let seed = 2939
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { a: rnd(61), b: rnd(61), n: 1 + rnd(6) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
