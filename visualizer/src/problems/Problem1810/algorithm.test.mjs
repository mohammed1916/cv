import test from 'node:test'
import assert from 'node:assert/strict'
import { makeMaster, findMinCost } from './algorithm.js'

const solve = (grid, start, target) => findMinCost(makeMaster(grid, start, target))

test('1810 the cheaper route wins over the short one', () => {
  assert.equal(solve([[1, 4, 1], [0, 2, 3], [5, 1, 1]], [0, 0], [2, 2]), 8)
})

test('1810 a walled target returns -1', () => {
  assert.equal(solve([[2, 0, 3], [0, 1, 1]], [0, 0], [1, 2]), -1)
})

test('1810 a single step costs the entered cell', () => {
  assert.equal(solve([[1, 7]], [0, 0], [0, 1]), 7)
})

test('1810 the master reports entry costs and rejects blocked moves', () => {
  const master = makeMaster([[1, 5], [0, 2]], [0, 0], [1, 1])
  assert.equal(master.move('D'), -1)
  assert.equal(master.move('R'), 5)
  assert.equal(master.move('D'), 2)
  assert.equal(master.isTarget(), true)
})
