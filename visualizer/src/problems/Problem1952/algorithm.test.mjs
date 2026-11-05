import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result
const isPrime = k => { if (k < 2) return false; for (let d = 2; d * d <= k; d++) if (k % d === 0) return false; return true }

test('1952 small values', () => {
  assert.equal(solve(4), true)
  assert.equal(solve(9), true)
  assert.equal(solve(6), false)
  assert.equal(solve(1), false)
})

test('1952 matches prime-square rule up to 100', () => {
  for (let n = 1; n <= 100; n++) assert.equal(solve(n), Math.sqrt(n) % 1 === 0 && isPrime(Math.sqrt(n)), `n=${n}`)
})
