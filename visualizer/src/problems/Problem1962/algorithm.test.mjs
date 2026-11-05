import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (piles, k) => buildTrace(parseInput(JSON.stringify({ piles, k }))).result
// Exhaustive search over which pile to halve at each step.
const brute = (piles, k) => {
  let best = Infinity
  const rec = (arr, left) => {
    if (left === 0) { best = Math.min(best, arr.reduce((a, b) => a + b, 0)); return }
    arr.forEach((p, i) => {
      const next = [...arr]
      next[i] = p - Math.floor(p / 2)
      rec(next, left - 1)
    })
  }
  rec(piles, k)
  return best
}

test('1962 invented piles', () => {
  assert.equal(solve([5, 4, 9], 2), 12)
  assert.equal(solve([7], 1), 4)
})

test('1962 matches exhaustive search', () => {
  const cases = [[[5, 4, 9], 3], [[10, 10], 4], [[1, 2, 3], 2], [[8, 3, 6], 4], [[13], 3]]
  for (const [p, k] of cases) assert.equal(solve(p, k), brute(p, k), JSON.stringify([p, k]))
})
