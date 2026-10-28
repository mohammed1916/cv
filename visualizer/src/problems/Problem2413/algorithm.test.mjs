import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = n => buildTrace(parseInput(JSON.stringify({ n }))).result

test('2413 official examples', () => {
  assert.equal(solve(5), 10)
  assert.equal(solve(6), 6)
})

test('2413 edge cases and validation', () => {
  assert.equal(solve(1), 2)
  assert.equal(solve(150), 150)
  assert.throws(() => parseInput('{"n":0}'))
  assert.throws(() => parseInput('{"n":151}'))
})

// Independent oracle: scan upward for the first number divisible by both 2 and n.
function oracle(n) {
  for (let m = 1; ; m++) if (m % 2 === 0 && m % n === 0) return m
}

test('2413 every value up to the cap matches a scan oracle', () => {
  for (let n = 1; n <= 150; n++) assert.equal(solve(n), oracle(n), String(n))
})
