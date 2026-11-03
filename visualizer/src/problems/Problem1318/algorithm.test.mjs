import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b, c) => buildTrace({ a, b, c }).result

test('1318 sample inputs give the expected flip counts', () => {
  assert.equal(solve(12, 5, 6), 3)
  assert.equal(solve(2, 6, 5), 3)
  assert.equal(solve(8, 8, 0), 2)
})

test('1318 rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2,3]'), /object/)
  assert.throws(() => parseInput('{"a":1,"b":2,"c":-1}'), /c/)
  assert.throws(() => parseInput('{"a":1,"b":"2","c":3}'), /b/)
})

// Independent oracle: try every value x for a and y for b with x | y === c, and keep the cheapest total flips.
test('1318 matches a brute-force oracle on all small triples', () => {
  for (let a = 0; a < 16; a++) for (let b = 0; b < 16; b++) for (let c = 0; c < 16; c++) {
    let best = Infinity
    for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++) {
      if ((x | y) === c) best = Math.min(best, popcount(a ^ x) + popcount(b ^ y))
    }
    assert.equal(solve(a, b, c), best, `a=${a} b=${b} c=${c}`)
  }
})

function popcount(v) { let n = 0; while (v) { n += v & 1; v >>= 1 } return n }
