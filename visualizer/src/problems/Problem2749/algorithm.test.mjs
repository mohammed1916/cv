import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (num1, num2) => buildTrace({ num1, num2 }).result

test('2749 official examples', () => {
  assert.equal(solve(3, -2), 3)
  assert.equal(solve(5, 7), -1)
})

test('2749 edge cases: a single operation and an impossible target', () => {
  assert.equal(solve(1, 0), 1)
  assert.equal(solve(2, 0), 1)
  assert.equal(solve(1, 1), -1)
})

test('2749 rejects out-of-range inputs', () => {
  assert.throws(() => parseInput('{"num1":0,"num2":1}'))
  assert.throws(() => parseInput('{"num1":5,"num2":1001}'))
})

// Independent oracle: dynamic programming on whether x is a sum of exactly k powers of two, found by trying every power.
function oracle(num1, num2) {
  const memo = new Map()
  const exactly = (x, k) => {
    if (k === 0) return x === 0
    if (x < k) return false
    const key = `${x},${k}`
    if (memo.has(key)) return memo.get(key)
    let ok = false
    for (let p = 1; p <= x && !ok; p *= 2) ok = exactly(x - p, k - 1)
    memo.set(key, ok)
    return ok
  }
  for (let k = 0; k <= 64; k++) {
    const x = num1 - k * num2
    if (x >= 0 && exactly(x, k)) return k
  }
  return -1
}

test('2749 random inputs match a power-sum dynamic programme', () => {
  let seed = 2749
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const num1 = 1 + rnd(60)
    const num2 = rnd(121) - 60
    assert.equal(solve(num1, num2), oracle(num1, num2), JSON.stringify({ num1, num2 }))
  }
})
