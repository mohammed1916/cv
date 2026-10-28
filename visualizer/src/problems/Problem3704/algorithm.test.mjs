import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

test('3704 official examples', () => {
  assert.equal(solve(2), 1)
  assert.equal(solve(3), 2)
  assert.equal(solve(11), 8)
})

test('3704 carries and zero digits', () => {
  // n = 10: the pairs are (1,9) through (9,1), nine in all.
  assert.equal(solve(10), 9)
  // n = 100: a = 1..9 gives 9 pairs; a = 10x + y with x, y in 1..9 gives 81 more (the partner may be one digit). Total 90.
  assert.equal(solve(100), 90)
})

test('3704 rejects n outside 2 to 1000000', () => {
  assert.throws(() => parseInput('1'))
  assert.throws(() => parseInput('1000001'))
})

// Independent oracle: try every a from 1 to n - 1 and test both a and n - a directly.
function oracle(n) {
  let count = 0
  for (let a = 1; a < n; a++) {
    if (!String(a).includes('0') && !String(n - a).includes('0')) count++
  }
  return count
}

test('3704 random n match a direct enumeration oracle', () => {
  let seed = 3704
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(2000)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
