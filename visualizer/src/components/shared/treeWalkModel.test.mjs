import assert from 'node:assert/strict'
import test from 'node:test'
import { describeWalkStack, stackRows, treeWalk, WALK_ROW_CAP } from './treeWalkModel.js'

test('treeWalk normalises entries and unknown kinds', () => {
  const walk = treeWalk({ kind: 'nope', stack: [5, { label: 'f(3)', note: 'left' }], order: [1] })
  assert.equal(walk.kind, 'recursion')
  assert.deepEqual(walk.stack, [{ label: '5', note: '' }, { label: 'f(3)', note: 'left' }])
  assert.equal(treeWalk({ stack: null }).stack, null)
})

test('a stack shows its top first and a queue shows its front first', () => {
  const stack = stackRows(treeWalk({ kind: 'stack', stack: ['a', 'b', 'c'] }))
  assert.deepEqual(stack.rows.map(r => r.label), ['c', 'b', 'a'])
  assert.equal(stack.rows[0].tag, 'next pop')
  const queue = stackRows(treeWalk({ kind: 'queue', stack: ['a', 'b'] }))
  assert.deepEqual(queue.rows.map(r => r.label), ['a', 'b'])
  assert.equal(queue.rows[0].tag, 'front')
})

test('rows are capped and the hidden count reported', () => {
  const big = treeWalk({ stack: Array.from({ length: WALK_ROW_CAP + 5 }, (_, i) => i) })
  const { rows, hidden, depth } = stackRows(big)
  assert.equal(rows.length, WALK_ROW_CAP)
  assert.equal(hidden, 5)
  assert.equal(depth, WALK_ROW_CAP + 5)
})

test('describeWalkStack words', () => {
  assert.equal(describeWalkStack(treeWalk({ stack: [] })), 'No calls are pending.')
  assert.equal(describeWalkStack(treeWalk({ stack: ['f(4)', 'f(2)'] })), '2 pending calls: f(4) → f(2)')
  assert.equal(describeWalkStack(treeWalk({ kind: 'queue', stack: [] })), 'The queue is empty.')
  assert.equal(describeWalkStack(treeWalk({ stack: null })), '')
})
