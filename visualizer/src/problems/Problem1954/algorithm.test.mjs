import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = n => buildTrace(parseInput(String(n))).result
// Count apples directly: sum of |i| + |j| over every tree in the square.
const cells = k => { let t = 0; for (let i = -k; i <= k; i++) for (let j = -k; j <= k; j++) t += Math.abs(i) + Math.abs(j); return t }
const brute = n => { for (let k = 1; ; k++) if (cells(k) >= n) return 8 * k }

test('1954 formula matches direct count for small half-sides', () => {
  for (let k = 0; k <= 12; k++) assert.equal(2 * k * (k + 1) * (2 * k + 1), cells(k), `k=${k}`)
})

test('1954 invented needs', () => {
  assert.equal(solve(13), 16)
  assert.equal(solve(1), 8)
  assert.equal(solve(12), 8)
})

test('1954 matches direct search', () => {
  for (const n of [1, 2, 12, 13, 59, 60, 61, 500, 1000, 4321]) assert.equal(solve(n), brute(n), `n=${n}`)
})
