import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = k => buildTrace({ k }).result

test('3790 official examples', () => {
  assert.equal(solve(3), 3)
  assert.equal(solve(7), 6)
  assert.equal(solve(2), -1)
})

test('3790 edge case: a multiple of 5 can never divide an all-ones number', () => {
  assert.equal(solve(5), -1)
})

test('3790 rejects k of 1', () => {
  assert.throws(() => parseInput('{"k":1}'))
})

// Independent oracle: build each all-ones number exactly with BigInt and test divisibility, searching up to 200 digits.
// The shortest such number has at most k digits, so 200 digits covers every k up to 60.
function oracle(k) {
  const K = BigInt(k)
  let repunit = 0n
  for (let length = 1; length <= 200; length++) {
    repunit = repunit * 10n + 1n
    if (repunit % K === 0n) return length
  }
  return -1
}

test('3790 every k from 2 to 60 matches the BigInt oracle', () => {
  for (let k = 2; k <= 60; k++) assert.equal(solve(k), oracle(k), `k=${k}`)
})
