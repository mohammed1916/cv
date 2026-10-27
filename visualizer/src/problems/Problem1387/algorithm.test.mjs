import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (lo, hi, k) => buildTrace(parseInput(JSON.stringify({ lo, hi, k }))).result

test('1387 official examples', () => {
  assert.equal(solve(12, 15, 2), 13)
  assert.equal(solve(7, 11, 4), 7)
})

test('1387 a single integer is its own answer', () => {
  assert.equal(solve(5, 5, 1), 5)
})

test('1387 rejects k beyond the range', () => {
  assert.throws(() => parseInput('{"lo":1,"hi":3,"k":4}'))
})

// Independent oracle: count the steps to 1 by direct simulation, then sort the pairs with a comparator.
function oracle(lo, hi, k) {
  const pairs = []
  for (let x = lo; x <= hi; x++) {
    let v = x
    let count = 0
    while (v !== 1) {
      v = v % 2 === 0 ? v / 2 : 3 * v + 1
      count++
    }
    pairs.push([count, x])
  }
  pairs.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]))
  return pairs[k - 1][1]
}

test('1387 seeded random ranges match a direct simulation', () => {
  let seed = 1387
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const lo = 1 + rnd(900)
    const hi = lo + rnd(60)
    const k = 1 + rnd(hi - lo + 1)
    assert.equal(solve(lo, hi, k), oracle(lo, hi, k), `${lo} ${hi} ${k}`)
  }
})
