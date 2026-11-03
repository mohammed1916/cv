import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (capacity, itemSize) => buildTrace(parseInput(JSON.stringify({ capacity, itemSize }))).result

test('3861 invented example picks the tightest fit', () => {
  assert.equal(solve([9, 4, 6, 4], 5), 2)
})

test('3861 ties keep the earliest index', () => {
  assert.equal(solve([7, 7, 7], 7), 0)
})

test('3861 no box fits', () => {
  assert.equal(solve([3, 1, 2], 4), -1)
})
