import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace({ n, k }).result

test('3821 official examples', () => {
  assert.equal(solve(4, 2), 9)
  assert.equal(solve(3, 1), 4)
})

test('3821 edge cases: the first number with k bits is 2^k - 1', () => {
  assert.equal(solve(1, 1), 1)
  assert.equal(solve(1, 3), 7)
})

test('3821 rejects k of zero', () => {
  assert.throws(() => parseInput('{"n":1,"k":0}'))
})

// Independent oracle: count upward from 1, testing each number's popcount, until the n-th match.
function oracle(n, k) {
  let found = 0
  for (let x = 1; ; x++) {
    let bits = 0
    for (let y = x; y > 0; y >>= 1) bits += y & 1
    if (bits === k && ++found === n) return x
  }
}

test('3821 every n up to 20 and k up to 6 matches the upward-count oracle', () => {
  for (let k = 1; k <= 6; k++) {
    for (let n = 1; n <= 20; n++) assert.equal(solve(n, k), oracle(n, k), `n=${n} k=${k}`)
  }
})
