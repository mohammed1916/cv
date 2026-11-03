import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3225 worked examples', () => {
  assert.equal(solve([[2, 0, 4], [0, 3, 0], [5, 1, 0]]), 11)
  assert.equal(solve([[7, 1, 0, 2], [3, 0, 6, 0], [0, 4, 9, 1], [2, 5, 0, 3]]), 29)
})

test('3225 a single cell never scores', () => {
  assert.equal(solve([[7]]), 0)
})

test('3225 two columns: each white cell beside a black one scores', () => {
  // Blacking column 0 fully turns column 1 cells beside it into scorers.
  assert.equal(solve([[4, 6], [4, 6]]), 12)
})

test('3225 rejects non-square grids', () => {
  assert.throws(() => parseInput('{"grid":[[1,2]]}'))
  assert.throws(() => parseInput('{"grid":[[1,2],[3,4],[5,6]]}'))
})
