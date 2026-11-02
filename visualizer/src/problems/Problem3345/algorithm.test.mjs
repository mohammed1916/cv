import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, t) => buildTrace({ n, t }).result

test('3345 worked examples', () => {
  assert.equal(solve(2, 2), 2)
  assert.equal(solve(15, 7), 17)
  assert.equal(solve(99, 10), 100)
})

test('3345 edge cases', () => {
  assert.equal(solve(1, 1), 1)
  assert.equal(solve(100, 1), 100)
  assert.equal(solve(100, 10), 100)
  assert.equal(solve(19, 10), 20)
})

test('3345 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":0,"t":1}'))
  assert.throws(() => parseInput('{"n":5,"t":11}'))
})

// Oracle: the same search written with a string-based digit product and a bounded scan.
function oracle(n, t) {
  for (let x = n; x < n + 100000; x++) {
    const digits = x.toString().split('').map(Number)
    const product = digits.reduce((a, b) => a * b, 1)
    if (product % t === 0) return x
  }
  return -1
}

test('3345 every n and t up to small bounds match the oracle', () => {
  for (let n = 1; n <= 100; n++) {
    for (let t = 1; t <= 10; t++) {
      assert.equal(solve(n, t), oracle(n, t), JSON.stringify({ n, t }))
    }
  }
})
