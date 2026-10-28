import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = minutes => buildTrace(parseInput(JSON.stringify({ minutes }))).result

test('2579 official examples', () => {
  assert.equal(solve(1), 1)
  assert.equal(solve(2), 5)
  assert.equal(solve(3), 13)
})

test('2579 edge cases and validation', () => {
  assert.equal(solve(200), 2 * 200 * 200 - 2 * 200 + 1)
  assert.throws(() => parseInput('{"minutes":0}'))
  assert.throws(() => parseInput('{"minutes":201}'))
})

// Independent oracle: count lattice points with |x| + |y| <= n - 1, which is the colored diamond.
function oracle(n) {
  let count = 0
  for (let x = -(n - 1); x <= n - 1; x++) {
    for (let y = -(n - 1); y <= n - 1; y++) {
      if (Math.abs(x) + Math.abs(y) <= n - 1) count++
    }
  }
  return count
}

test('2579 seeded random minutes match a lattice-count oracle', () => {
  let seed = 2579
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const minutes = 1 + rnd(40)
    assert.equal(solve(minutes), oracle(minutes), String(minutes))
  }
})
