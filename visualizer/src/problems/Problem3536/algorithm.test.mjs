import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(n).result

test('3536 worked examples', () => {
  assert.equal(solve(31), 3)
  assert.equal(solve(22), 4)
  assert.equal(solve(1020), 2)
})

test('3536 repeated and zero digits', () => {
  assert.equal(solve(10), 0)
  assert.equal(solve(11), 1)
  assert.equal(solve(100), 0)
  assert.equal(solve(999999999), 81)
  assert.equal(solve(1000000000), 0)
})

test('3536 rejects values outside the range', () => {
  assert.throws(() => parseInput('9'))
  assert.throws(() => parseInput('1000000001'))
  assert.throws(() => parseInput('12.5'))
})

// Independent oracle: compare every pair of digit positions.
function oracle(n) {
  const digits = String(n).split('').map(Number)
  let best = 0
  for (let i = 0; i < digits.length; i++) for (let j = i + 1; j < digits.length; j++) best = Math.max(best, digits[i] * digits[j])
  return best
}

test('3536 random integers match a pairwise oracle', () => {
  let seed = 3536
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const n = 10 + rnd(999990)
    assert.equal(solve(n), oracle(n), String(n))
  }
})
