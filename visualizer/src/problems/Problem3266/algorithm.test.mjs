import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3266 official examples', () => {
  assert.deepEqual(solve({ nums: [2, 1, 3, 5, 6], k: 5, multiplier: 2 }), [8, 4, 6, 5, 6])
  assert.deepEqual(solve({ nums: [1, 2], k: 3, multiplier: 4 }), [16, 8])
})

test('3266 large exponents are reduced modulo 1000000007', () => {
  // 2^30 = 1073741824, and 1073741824 - 1000000007 = 73741817.
  assert.deepEqual(solve({ nums: [1], k: 30, multiplier: 2 }), [73741817])
})

test('3266 a multiplier of 1 changes nothing', () => {
  assert.deepEqual(solve({ nums: [5, 3], k: 10, multiplier: 1 }), [5, 3])
})

test('3266 rejects a multiplier of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":1,"multiplier":0}'))
})

// Independent oracle: multiply exact BigInt values one at a time, choosing the smallest pair by sorting every round.
function oracle({ nums, k, multiplier }) {
  const values = nums.map(v => BigInt(v))
  const m = BigInt(multiplier)
  for (let round = 0; round < k; round++) {
    const order = values.map((v, i) => [v, i]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]))
    values[order[0][1]] *= m
  }
  const MOD = 1000000007n
  return values.map(v => Number(v % MOD))
}

test('3266 random inputs match an exact sorted oracle', () => {
  let seed = 3266
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(20)), k: 1 + rnd(30), multiplier: 1 + rnd(5) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
