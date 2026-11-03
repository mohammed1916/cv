import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace({ n }).result

test('1281 sample numbers give the expected differences', () => {
  assert.equal(solve(3945), 519)
  assert.equal(solve(1), 0)
  assert.equal(solve(100000), -1)
})

test('1281 single digits and zeros inside a number', () => {
  assert.equal(solve(7), 0)
  assert.equal(solve(1002), -3)
})

test('1281 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":0}'), /1 to 100000/)
  assert.throws(() => parseInput('{"n":12.5}'), /integer/)
  assert.throws(() => parseInput('{"n":100001}'), /100000/)
  assert.throws(() => parseInput('42'), /object/)
})

// Independent oracle: compute the digits arithmetically with division and modulo instead of string splitting.
test('1281 every value in range matches an arithmetic oracle', () => {
  for (let n = 1; n <= 2000; n++) {
    let x = n
    let product = 1
    let sum = 0
    while (x > 0) {
      const d = x % 10
      product *= d
      sum += d
      x = Math.floor(x / 10)
    }
    assert.equal(solve(n), product - sum, `n=${n}`)
  }
})
