import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (low, high) => buildTrace({ low, high }).result

test('1523 sample intervals give hand-counted answers', () => {
  assert.equal(solve(3, 7), 3)
  assert.equal(solve(8, 10), 1)
  assert.equal(solve(4, 4), 0)
  assert.equal(solve(0, 0), 0)
})

test('1523 every interval up to 60 matches a brute-force count', () => {
  for (let low = 0; low <= 60; low++) for (let high = low; high <= 60; high++) {
    let count = 0
    for (let x = low; x <= high; x++) if (x % 2 === 1) count++
    assert.equal(solve(low, high), count, `${low}..${high}`)
  }
})

test('1523 the largest interval uses the same formula', () => {
  assert.equal(solve(1, 1000000000), 500000000)
  assert.equal(solve(0, 1000000000), 500000000)
})

test('1523 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"low":5,"high":2}'), /low <= high/)
  assert.throws(() => parseInput('{"low":1.5,"high":2}'), /integers/)
  assert.throws(() => parseInput('{"low":-1,"high":2}'), /0 <=/)
})
