import test from 'node:test'
import assert from 'node:assert/strict'
import { canMerge, inorder } from './algorithm.js'

const leaf = val => ({ val, left: null, right: null })
const node = (val, left = null, right = null) => ({ val, left, right })

test('1932 a three-tree chain merges into one valid search tree', () => {
  const merged = canMerge([node(7, leaf(2), leaf(9)), node(2, leaf(1)), node(9, leaf(8), leaf(11))])
  assert.deepEqual(inorder(merged), [1, 2, 7, 8, 9, 11])
  assert.equal(merged.val, 7)
})

test('1932 a larger merge keeps every value in order', () => {
  const merged = canMerge([node(10, leaf(4), leaf(15)), node(4, leaf(2), leaf(6)), node(15, leaf(12), leaf(20))])
  assert.deepEqual(inorder(merged), [2, 4, 6, 10, 12, 15, 20])
})

test('1932 a merge that breaks the search order returns null', () => {
  assert.equal(canMerge([node(10, leaf(4), leaf(15)), node(4, leaf(2), leaf(6)), node(15, leaf(5), leaf(20))]), null)
})

test('1932 two roots with no connecting leaf cannot merge', () => {
  assert.equal(canMerge([node(5, leaf(3)), node(4)]), null)
  assert.equal(canMerge([node(10, leaf(4), leaf(15)), node(7)]), null)
})

test('1932 a single tree is its own result', () => {
  assert.deepEqual(inorder(canMerge([node(3, leaf(1), leaf(5))])), [1, 3, 5])
})
