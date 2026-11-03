import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('3857 invented size six', () => {
  assert.equal(solve(6), 15)
})

test('3857 two and one', () => {
  assert.equal(solve(2), 1)
  assert.equal(solve(1), 0)
})

test('3857 every split order pays the same pair count', () => {
  for (let n = 1; n <= 12; n++) assert.equal(solve(n), (n * (n - 1)) / 2)
})
