import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result
const copy = g => g.map(r => [...r])

test('1914 invented 2 by 2 grid', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]], 1), [[2, 4], [1, 3]])
  assert.deepEqual(solve([[1, 2], [3, 4]], 2), [[4, 3], [2, 1]])
})

test('1914 rotations compose and a full turn is the identity', () => {
  const g = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
  assert.deepEqual(solve(g, 3), solve(solve(g, 1), 2))
  assert.deepEqual(solve(g, 12), g)
  assert.deepEqual(solve(g, 0), g)
  assert.deepEqual(solve(copy(g), 4 * 1 * 3), g)
})

test('1914 outer ring of 4 by 4 with one turn per step', () => {
  const g = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]
  const once = solve(g, 1)
  assert.equal(once[0][0], 2)
  assert.equal(once[3][0], 9)
  assert.equal(once[1][1], 7)
})
