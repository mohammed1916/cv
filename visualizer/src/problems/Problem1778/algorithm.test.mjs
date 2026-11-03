import test from 'node:test'
import assert from 'node:assert/strict'
import { makeMaster, findShortestPath } from './algorithm.js'

const solve = grid => findShortestPath(makeMaster(grid))

test('1778 a detour around blocked cells', () => {
  assert.equal(solve([[-1, 1, 0], [1, 0, 1], [1, 1, 2]]), 4)
})

test('1778 a target two steps away around a corner', () => {
  assert.equal(solve([[2, 1], [1, -1]]), 2)
})

test('1778 a target that cannot be reached', () => {
  assert.equal(solve([[2, 0, 1], [0, -1, 1]]), -1)
})

test('1778 the master only answers local questions', () => {
  const master = makeMaster([[-1, 1], [1, 2]])
  assert.equal(master.canMove('U'), false)
  assert.equal(master.canMove('R'), true)
  master.move('R')
  assert.equal(master.isTarget(), false)
  master.move('D')
  assert.equal(master.isTarget(), true)
})
