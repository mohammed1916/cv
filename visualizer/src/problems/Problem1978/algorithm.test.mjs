import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = employees => buildTrace(parseInput(JSON.stringify({ employees }))).result
// Explicit check: for each employee, look up the manager by scanning the table.
const brute = employees => employees
  .filter(e => e[3] < 30000 && e[2] !== null && !employees.some(m => m[0] === e[2]))
  .map(e => e[0])
  .sort((a, b) => a - b)

test('1978 invented employees', () => {
  assert.deepEqual(solve([[1, 'Kalel', 11, 20000], [11, 'Joziah', 6, 40000], [6, 'Ann', null, 90000], [7, 'Bo', 8, 10000]]), [7])
  assert.deepEqual(solve([[3, 'Cy', 9, 10000]]), [3])
})

test('1978 matches scanning check', () => {
  const cases = [
    [[1, 'a', 11, 20000], [11, 'b', 6, 40000], [6, 'c', null, 90000], [7, 'd', 8, 10000]],
    [[2, 'a', 3, 29999], [3, 'b', 4, 30000], [4, 'c', 1, 29000]],
    [[5, 'a', null, 1000], [6, 'b', 5, 500], [8, 'c', 99, 2000]],
  ]
  for (const c of cases) assert.deepEqual(solve(c.map(r => [...r])), brute(c), JSON.stringify(c))
})
