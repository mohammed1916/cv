import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = arrays => buildTrace(parseInput(JSON.stringify(arrays))).result
const brute = arrays => arrays.reduce((acc, arr) => acc.filter(x => arr.includes(x)), arrays[0]).sort((a, b) => a - b)

test('1940 invented arrays', () => {
  assert.deepEqual(solve([[1, 3, 4], [1, 4, 5], [1, 4, 6]]), [1, 4])
  assert.deepEqual(solve([[2, 5], [3, 6]]), [])
  assert.deepEqual(solve([[7, 9]]), [7, 9])
})

test('1940 matches set intersection', () => {
  const cases = [[[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 6]], [[1, 5, 9], [5, 9], [2, 5, 9, 12]], [[10, 20], [20, 30], [10, 20, 30]]]
  for (const c of cases) assert.deepEqual(solve(c), brute(c), JSON.stringify(c))
})
