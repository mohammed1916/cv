import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2312 official examples', () => {
  assert.equal(solve({ m: 3, n: 5, prices: [[1, 4, 2], [2, 2, 7], [2, 1, 3]] }), 19)
  assert.equal(solve({ m: 4, n: 6, prices: [[3, 2, 10], [1, 4, 2], [4, 1, 3]] }), 32)
})

test('2312 a single piece that fills the board', () => {
  assert.equal(solve({ m: 2, n: 2, prices: [[2, 2, 9]] }), 9)
})

test('2312 rejects a piece larger than the board', () => {
  assert.throws(() => parseInput('{"m":2,"n":2,"prices":[[3,1,5]]}'))
})

// Independent oracle: exhaustive search over every sequence of edge-to-edge cuts, without a table.
function oracle({ m, n, prices }) {
  const pieceValue = (h, w) => prices.reduce((best, [a, b, p]) => (a === h && b === w ? Math.max(best, p) : best), 0)
  const bestFor = (h, w) => {
    let value = pieceValue(h, w)
    for (let k = 1; k < w; k++) value = Math.max(value, bestFor(h, k) + bestFor(h, w - k))
    for (let k = 1; k < h; k++) value = Math.max(value, bestFor(k, w) + bestFor(h - k, w))
    return value
  }
  return bestFor(m, n)
}

test('2312 seeded random boards match an exhaustive cut search', () => {
  let seed = 2312
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const prices = Array.from({ length: 1 + rnd(3) }, () => [1 + rnd(m), 1 + rnd(n), 1 + rnd(9)])
    const input = { m, n, prices }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
