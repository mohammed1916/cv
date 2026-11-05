import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = points => buildTrace(parseInput(JSON.stringify(points))).result
// Direct quadratic dynamic programming over every pair of columns in adjacent rows.
const brute = points => {
  const m = points.length, n = points[0].length
  let dp = [...points[0]]
  for (let r = 1; r < m; r++) {
    dp = points[r].map((p, c) => p + Math.max(...dp.map((v, k) => v - Math.abs(c - k))))
  }
  return Math.max(...dp)
}

test('1937 invented matrices', () => {
  assert.equal(solve([[1, 2, 3], [1, 5, 1], [3, 1, 1]]), 9)
  assert.equal(solve([[7]]), 7)
  assert.equal(solve([[1, 0, 3], [0, 0, 0]]), 3)
})

test('1937 matches quadratic dynamic programming', () => {
  const cases = [[[1, 5, 2], [4, 0, 6], [2, 2, 9]], [[3, 1, 4, 1], [5, 9, 2, 6], [5, 3, 5, 8]], [[0, 0], [9, 0], [0, 9], [1, 1]], [[2, 7, 1, 8, 2], [8, 1, 8, 2, 8]]]
  for (const c of cases) assert.equal(solve(c), brute(c), JSON.stringify(c))
})
