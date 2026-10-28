import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ prime_factors: n }))).result

test('1808 official examples', () => {
  assert.equal(solve(3), 3)
  assert.equal(solve(8), 18)
})

test('1808 edge cases', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(4), 4)
  assert.equal(solve(5), 6)
})

test('1808 rejects values outside the visualization cap', () => {
  assert.throws(() => parseInput('{"prime_factors":0}'))
  assert.throws(() => parseInput('{"prime_factors":61}'))
})

// Independent oracle: the best product of parts that sum to n, found by dynamic programming with exact integers.
function oracle(n) {
  const best = [1n]
  for (let s = 1; s <= n; s++) {
    let top = 0n
    for (let p = 1; p <= s; p++) {
      const candidate = BigInt(p) * best[s - p]
      if (candidate > top) top = candidate
    }
    best[s] = top
  }
  return Number(best[n] % 1000000007n)
}

test('1808 every value up to the cap matches a dynamic-programming oracle', () => {
  for (let n = 1; n <= 60; n++) assert.equal(solve(n), oracle(n), String(n))
})
