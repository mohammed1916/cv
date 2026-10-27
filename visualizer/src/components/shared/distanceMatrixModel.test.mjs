import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCell, pivotCells, dequeLabels } from './distanceMatrixModel.js'

test('infinity reads as a symbol and other values as text', () => {
  assert.equal(formatCell(Infinity), '∞')
  assert.equal(formatCell(0), '0')
  assert.equal(formatCell(12), '12')
})

test('pivot covers row k and column k exactly once', () => {
  const cells = pivotCells(3, 1)
  assert.equal(cells.length, 5)
  assert.equal(new Set(cells.map(c => `${c.row}:${c.col}`)).size, 5)
  assert.ok(cells.every(c => c.row === 1 || c.col === 1))
})

test('deque labels keep front-to-back order', () => {
  const dist = [[0, 1], [1, 2]]
  assert.deepEqual(dequeLabels([[0, 0], [1, 1]], dist), ['(0, 0) at cost 0', '(1, 1) at cost 2'])
})
