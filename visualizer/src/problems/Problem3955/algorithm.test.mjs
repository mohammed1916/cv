import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, k) => buildTrace(parseInput(JSON.stringify({ n, k }))).result

test('3955 official examples', () => {
  assert.deepEqual(solve(3, 1), ['000', '010', '100'])
  assert.deepEqual(solve(1, 0), ['0', '1'])
})

test('3955 a large cost limit keeps every string with no adjacent 1s', () => {
  // Length 3 with no adjacent 1s has 5 strings: 000 010 001 100 101.
  assert.deepEqual(solve(3, 3), ['000', '001', '010', '100', '101'])
})

test('3955 rejects a k above n(n-1)/2', () => {
  assert.throws(() => parseInput('{"n":3,"k":4}'))
})

// Independent oracle: enumerate all 2^n strings, then keep those with no "11" and cost at most k.
function oracle(n, k) {
  const out = []
  for (let mask = 0; mask < 1 << n; mask++) {
    let s = ''
    let cost = 0
    for (let i = 0; i < n; i++) {
      const bit = (mask >> (n - 1 - i)) & 1
      s += bit ? '1' : '0'
      if (bit) cost += i
    }
    if (!s.includes('11') && cost <= k) out.push(s)
  }
  return out.sort()
}

test('3955 every n and k match an enumerate-all-strings oracle', () => {
  for (let n = 1; n <= 8; n++) for (let k = 0; k <= (n * (n - 1)) / 2; k++) {
    assert.deepEqual(solve(n, k), oracle(n, k), `n=${n} k=${k}`)
  }
})
