import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (students, mentors) => buildTrace(parseInput(JSON.stringify({ students, mentors }))).result
// Bitmask dynamic programming over mentor subsets, independent of the depth-first search.
const dp = (students, mentors) => {
  const m = students.length
  const score = (i, j) => students[i].filter((a, k) => a === mentors[j][k]).length
  const best = new Array(1 << m).fill(-1)
  best[0] = 0
  for (let mask = 0; mask < 1 << m; mask++) {
    if (best[mask] < 0) continue
    const i = [...mask.toString(2)].filter(c => c === '1').length
    if (i >= m) continue
    for (let j = 0; j < m; j++) if (!(mask & (1 << j))) best[mask | (1 << j)] = Math.max(best[mask | (1 << j)], best[mask] + score(i, j))
  }
  return best[(1 << m) - 1]
}

test('1947 invented survey', () => {
  assert.equal(solve([[1, 1, 0], [1, 0, 1]], [[1, 0, 0], [0, 1, 1]]), 3)
  assert.equal(solve([[0]], [[0]]), 1)
})

test('1947 matches bitmask dynamic programming', () => {
  const students = [[1, 0, 1, 0], [0, 0, 1, 1], [1, 1, 1, 0], [0, 1, 0, 0]]
  const mentors = [[1, 1, 0, 0], [0, 0, 0, 1], [1, 0, 1, 1], [0, 1, 1, 0]]
  assert.equal(solve(students, mentors), dp(students, mentors))
  const s2 = [[1, 0], [0, 0], [1, 1]]
  const m2 = [[0, 0], [1, 0], [1, 1]]
  assert.equal(solve(s2, m2), dp(s2, m2))
})
