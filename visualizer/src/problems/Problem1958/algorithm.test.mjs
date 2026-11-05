import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const board = rows => [...rows, ...Array(8 - rows.length).fill('........')]
const solve = (rows, r, c, color) => buildTrace(parseInput(JSON.stringify({ board: board(rows), rMove: r, cMove: c, color }))).result

test('1958 horizontal line closed by a same colour cell', () => {
  assert.equal(solve(['WB......'], 0, 2, 'W'), true)
  assert.equal(solve(['WB......'], 0, 2, 'B'), false)
  assert.equal(solve(['WBB.....'], 0, 3, 'W'), true)
})

test('1958 diagonal line', () => {
  const rows = ['W.......', '.B......', '..B.....']
  assert.equal(solve(rows, 3, 3, 'W'), true)
  assert.equal(solve(rows, 3, 3, 'B'), false)
})

test('1958 a same-colour neighbour alone is not a line', () => {
  assert.equal(solve(['WW......'], 0, 2, 'W'), false)
})
