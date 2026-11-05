import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (employees, salaries) => buildTrace(parseInput(JSON.stringify({ employees, salaries }))).result
// Explicit per-ID check of both conditions.
const brute = (employees, salaries) => {
  const ids = new Set([...employees.map(e => e[0]), ...salaries.map(s => s[0])])
  return [...ids].filter(id => {
    const e = employees.find(x => x[0] === id)
    const s = salaries.find(x => x[0] === id)
    return !e || e[1] === null || !s
  }).sort((a, b) => a - b)
}

test('1965 invented tables', () => {
  assert.deepEqual(solve([[2, 'Ann'], [3, null], [4, 'Bo']], [[2, 5000], [4, 700]]), [3])
  assert.deepEqual(solve([[1, 'Cy']], [[9, 300]]), [1, 9])
})

test('1965 matches per-ID check', () => {
  const cases = [
    [[[2, 'Ann'], [3, null], [4, 'Bo']], [[2, 5000], [7, 8000]]],
    [[[1, 'A'], [5, null], [6, 'F']], [[1, 1], [5, 2], [6, 3]]],
    [[[8, 'H']], []],
  ]
  for (const [e, s] of cases) assert.deepEqual(solve(e, s), brute(e, s), JSON.stringify([e, s]))
})
