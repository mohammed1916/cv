import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result
const brute = n => {
  // Count digit strings with the parity rule by dynamic programming over positions.
  let count = 1n
  for (let i = 0; i < n; i++) count = count * (i % 2 === 0 ? 5n : 4n) % 1000000007n
  return Number(count)
}

test('1922 small lengths', () => {
  assert.equal(solve(1), 5)
  assert.equal(solve(4), 400)
  assert.equal(solve(50 - 10), brute(40) % 1000000007)
})

test('1922 matches direct product for lengths up to 40', () => {
  for (let n = 1; n <= 40; n++) assert.equal(solve(n), brute(n), `n=${n}`)
})
