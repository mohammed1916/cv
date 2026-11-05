import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (parents, queries) => buildTrace(parseInput(JSON.stringify({ parents, queries }))).result
// Walk each query node up to the root, check every ancestor value directly.
const brute = (parents, queries) => queries.map(([node, val]) => {
  let best = 0
  for (let v = node; v !== -1; v = parents[v]) best = Math.max(best, v ^ val)
  return best
})

test('1938 invented tree', () => {
  assert.deepEqual(solve([-1, 0, 0, 2], [[3, 1], [1, 3]]), [3, 3])
  assert.deepEqual(solve([-1, 0, 1], [[2, 0], [1, 2]]), [2, 3])
})

test('1938 matches walking the ancestors', () => {
  const cases = [
    [[-1, 0, 0, 1, 1, 2], [[3, 2], [4, 7], [5, 1], [2, 6]]],
    [[-1, 0, 1, 2, 3, 4, 5], [[6, 3], [4, 0], [0, 7], [5, 5]]],
    [[-1, 0, 0, 0, 3, 3, 2, 6], [[4, 5], [7, 1], [1, 6], [5, 2], [6, 3]]],
  ]
  for (const [p, q] of cases) assert.deepEqual(solve(p, q), brute(p, q), JSON.stringify([p, q]))
})
