import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, limit) => buildTrace(parseInput(JSON.stringify({ n, limit }))).result

test('2928 examples', () => {
  assert.equal(solve(5, 2), 3)
  assert.equal(solve(3, 3), 10)
})

test('2928 edge cases', () => {
  assert.equal(solve(1, 1), 3)
  assert.equal(solve(50, 1), 0)
})

test('2928 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":0,"limit":2}'))
  assert.throws(() => parseInput('{"n":5,"limit":51}'))
})

// Independent oracle: test every triple (a, b, c) with a, b, c in 0..n and keep those that sum to n and fit the limit.
function oracle(n, limit) {
  let count = 0
  for (let a = 0; a <= n; a++) for (let b = 0; b <= n; b++) for (let c = 0; c <= n; c++) {
    if (a + b + c === n && a <= limit && b <= limit && c <= limit) count++
  }
  return count
}

test('2928 random cases match triple enumeration', () => {
  let seed = 2928
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(30)
    const limit = 1 + rnd(30)
    assert.equal(solve(n, limit), oracle(n, limit), JSON.stringify({ n, limit }))
  }
})
