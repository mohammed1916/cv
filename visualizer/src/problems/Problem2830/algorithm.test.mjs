import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2830 official examples', () => {
  assert.equal(solve({ n: 5, offers: [[0, 0, 1], [0, 2, 2], [1, 3, 2]] }), 3)
  assert.equal(solve({ n: 5, offers: [[0, 0, 1], [0, 2, 10], [1, 3, 2]] }), 10)
})

test('2830 no offers gives zero', () => {
  assert.equal(solve({ n: 4, offers: [] }), 0)
})

test('2830 rejects a range that ends before it starts', () => {
  assert.throws(() => parseInput('{"n":4,"offers":[[2,1,3]]}'))
  assert.throws(() => parseInput('{"n":4,"offers":[[0,4,3]]}'))
})

// Independent oracle: try every subset of offers and keep the best one whose ranges are pairwise disjoint.
function oracle({ offers }) {
  let best = 0
  for (let mask = 0; mask < 1 << offers.length; mask++) {
    const chosen = offers.filter((_, idx) => (mask >> idx) & 1)
    const disjoint = chosen.every((a, x) => chosen.every((b, y) => x === y || a[1] < b[0] || b[1] < a[0]))
    if (disjoint) best = Math.max(best, chosen.reduce((sum, o) => sum + o[2], 0))
  }
  return best
}

test('2830 random offers match a subset-search oracle', () => {
  let seed = 2830
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const offers = Array.from({ length: rnd(7) }, () => {
      const s = rnd(n)
      return [s, s + rnd(n - s), 1 + rnd(10)]
    })
    const input = { n, offers }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
