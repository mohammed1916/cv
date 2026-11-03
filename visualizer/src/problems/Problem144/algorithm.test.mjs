import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

test('a small tree is visited root, then left subtree, then right', () => {
  assert.deepEqual(buildTrace([5, 3, 8, 1, 4, null, 9]).result, [5, 3, 1, 4, 8, 9])
})

test('a right-leaning chain keeps its order', () => {
  assert.deepEqual(buildTrace([1, null, 2, null, 3]).result, [1, 2, 3])
})

test('an empty array gives an empty traversal', () => {
  assert.deepEqual(buildTrace([]).result, [])
})

test('a single root returns itself', () => {
  assert.deepEqual(buildTrace([7]).result, [7])
})

test('hand-traced sparse level-order trees give their preorder sequences', () => {
  assert.deepEqual(buildTrace([1, 2, 3, 4, 5, 6, 7]).result, [1, 2, 4, 5, 3, 6, 7])
  assert.deepEqual(buildTrace([9, null, 4, 2, null, 8, null, null, 6]).result, [9, 4, 2, 8, 6])
  assert.deepEqual(buildTrace([0, -1, 1, null, -2, 2, null, null, null, -3, 3]).result, [0, -1, -2, 1, 2, -3, 3])
  assert.deepEqual(buildTrace([4, 2, 6, 1, 3, 5, 7, null, null, null, null, null, null, 8]).result, [4, 2, 1, 3, 6, 5, 7, 8])
})

test('frames use declared phases and existing code lines', () => {
  const ids = new Set(phases.map(p => p.id))
  for (const frame of buildTrace([2, null, 7, 6, null, 4]).frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(code.some(l => l.line === frame.activeLine))
  }
  assert.equal(code.length, python.split('\n').length)
})

test('parseInput rejects a null root and oversize trees', () => {
  assert.throws(() => parseInput('[null,1]'), /root/)
  assert.throws(() => parseInput(JSON.stringify(Array(32).fill(1))), /31/)
  assert.deepEqual(parseInput('[3,null,4]'), [3, null, 4])
})
