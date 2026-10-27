import test from 'node:test'
import assert from 'node:assert/strict'
import { diffListLinks, describeLinkRewrites, walkList, detachedIds, groupPointers, listNodeLabel } from './listPointerModel.js'

test('diffListLinks reports changed next pointers and head', () => {
  const before = { head: 0, nexts: { 0: 1, 1: 2, 2: null } }
  const after = { head: 2, nexts: { 0: null, 1: 0, 2: 1 } }
  assert.deepEqual(diffListLinks(before, after), [
    { field: 'head', id: 'head', from: 0, to: 2 },
    { field: 'next', id: 0, from: 1, to: null },
    { field: 'next', id: 1, from: 2, to: 0 },
    { field: 'next', id: 2, from: null, to: 1 },
  ])
  assert.deepEqual(diffListLinks(null, after), [])
  assert.deepEqual(diffListLinks(after, after), [])
})

test('describeLinkRewrites states before and after', () => {
  const lines = describeLinkRewrites([{ field: 'next', id: 1, from: 2, to: null }, { field: 'head', id: 'head', from: 0, to: 2 }], id => id * 10)
  assert.equal(lines[0], 'node 1 (value 10).next was node 2 (value 20), now null')
  assert.equal(lines[1], 'head moved from node 0 (value 0) to node 2 (value 20)')
  assert.equal(listNodeLabel(null), 'null')
})

test('walkList finds order, cycles, and detached nodes', () => {
  assert.deepEqual(walkList({ 0: 1, 1: 2, 2: null }, 0), { order: [0, 1, 2], cycleTo: null })
  assert.deepEqual(walkList({ 0: 1, 1: 0 }, 0), { order: [0, 1], cycleTo: 0 })
  assert.deepEqual(walkList({}, null), { order: [], cycleTo: null })
  assert.deepEqual(detachedIds([0, 1, 2, 3], { 0: 2, 1: null, 2: null, 3: 1 }, 0), [1, 3])
})

test('groupPointers groups labels per node', () => {
  const groups = groupPointers([{ label: 'prev', nodeId: 1 }, { label: 'cur', nodeId: 1 }, { label: 'next', nodeId: null }])
  assert.deepEqual(groups.get(1), ['prev', 'cur'])
  assert.deepEqual(groups.get(null), ['next'])
})

import { createListTracker } from './listPointerModel.js'
test('createListTracker reports rewrites and detached nodes between snapshots', () => {
  const table = { dummy: { val: 'D', next: 0 }, 0: { val: 5, next: 1 }, 1: { val: 6, next: null } }
  const tracker = createListTracker()
  const first = tracker.snapshot(table, 'dummy', [{ label: 'prev', nodeId: 'dummy' }])
  assert.deepEqual(first.nodes.map(n => n.id), ['dummy', 0, 1])
  assert.equal(first.rewrites.length, 0)
  table.dummy.next = 1
  const second = tracker.snapshot(table, 'dummy')
  assert.deepEqual(second.rewrites, [{ field: 'next', id: 'dummy', from: 0, to: 1 }])
  assert.deepEqual(second.detached.map(n => n.id), [0])
  assert.deepEqual(second.nodes.map(n => n.id), ['dummy', 1])
})
