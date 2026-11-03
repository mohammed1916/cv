import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007n
const solve = (nums, p, queries) => buildTrace({ nums, p, queries }).result

// Oracle: keep a plain array, sort it fresh for every query, and use BigInt exponentiation.
function oracle(nums, p, queries) {
  const list = [...nums]
  let cur = BigInt(p)
  return queries.map(([value, k]) => {
    list.push(value)
    const sorted = [...list].sort((a, b) => b - a)
    const x = sorted[k - 1]
    let result = 1n
    let base = cur % MOD
    let e = BigInt(x)
    while (e > 0n) {
      if (e & 1n) result = (result * base) % MOD
      base = (base * base) % MOD
      e >>= 1n
    }
    cur = result
    return Number(cur)
  })
}

test('3930 hand-checked presets', () => {
  assert.deepEqual(solve([4, 1, 7], 2, [[5, 2], [3, 1], [9, 3]]), oracle([4, 1, 7], 2, [[5, 2], [3, 1], [9, 3]]))
  assert.deepEqual(solve([], 3, [[2, 1], [2, 1], [8, 2]]), [9, 81, 6561])
})

test('3930 a zero exponent gives one', () => {
  assert.deepEqual(solve([0], 5, [[0, 2]]), [1])
})

test('3930 duplicates count separately for the k-th largest', () => {
  assert.deepEqual(solve([3, 3], 2, [[3, 3]]), [8])
})

test('3930 parser rejects k larger than the size after insertion', () => {
  assert.throws(() => parseInput('{"nums":[1],"p":2,"queries":[[4,3]]}'))
})

test('3930 matches a fresh-sort oracle on random inputs', () => {
  let seed = 3930
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: rnd(4) }, () => rnd(10))
    const p = rnd(10)
    const queries = []
    let size = nums.length
    for (let q = 0; q < 1 + rnd(4); q += 1) {
      size += 1
      queries.push([rnd(10), 1 + rnd(size)])
    }
    assert.deepEqual(solve(nums, p, queries), oracle(nums, p, queries), JSON.stringify({ nums, p, queries }))
  }
})
