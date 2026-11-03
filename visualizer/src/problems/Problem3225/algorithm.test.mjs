import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('3225 worked examples', () => {
  assert.equal(solve([[0, 0, 0, 0, 0], [0, 0, 3, 0, 0], [0, 1, 0, 0, 0], [5, 0, 0, 3, 0], [0, 0, 0, 0, 2]]), 11)
  assert.equal(solve([[10, 9, 0, 0, 15], [7, 1, 0, 8, 0], [5, 20, 0, 11, 0], [0, 0, 0, 1, 2], [8, 12, 1, 10, 3]]), 94)
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
