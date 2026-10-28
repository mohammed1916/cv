import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3492 official examples', () => {
  assert.equal(solve({ n: 3, w: 2, maxWeight: 7 }), 3)
  assert.equal(solve({ n: 3, w: 3, maxWeight: 7 }), 2)
})

test('3492 a weight of zero is rejected', () => {
  assert.throws(() => parseInput('{"n":3,"w":0,"maxWeight":7}'))
})

// Independent oracle: try every number of containers from 0 up to n * n and keep the largest that fits.
function oracle({ n, w, maxWeight }) {
  let best = 0
  for (let c = 0; c <= n * n; c++) {
    if (c * w <= maxWeight) best = c
  }
  return best
}

test('3492 random inputs match the count-by-count oracle', () => {
  let seed = 3492
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { n: 1 + rnd(10), w: 1 + rnd(10), maxWeight: rnd(201) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
