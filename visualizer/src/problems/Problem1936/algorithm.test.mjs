import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (rungs, dist) => buildTrace(parseInput(JSON.stringify({ rungs, dist }))).result
// Brute force: try every increasing set of inserted heights is too slow; instead check each gap by walking up one unit at a time.
const brute = (rungs, dist) => {
  let prev = 0, added = 0
  for (const r of rungs) {
    let at = prev, need = 0
    // Walk from prev to r, adding a rung whenever the next climb would exceed dist.
    while (r - at > dist) { at += dist; need++ }
    added += need
    prev = r
  }
  return added
}

test('1936 invented ladders', () => {
  assert.equal(solve([2, 5, 9], 3), 1)
  assert.equal(solve([3, 6, 8, 10], 3), 0)
  assert.equal(solve([1], 1), 0)
  assert.equal(solve([10], 3), 3)
})

test('1936 matches stepwise walk', () => {
  for (const [r, d] of [[[3, 4, 6, 7], 2], [[5, 11, 30], 4], [[2, 3, 9, 20], 5], [[7, 8, 40], 6]]) assert.equal(solve(r, d), brute(r, d), JSON.stringify([r, d]))
})
