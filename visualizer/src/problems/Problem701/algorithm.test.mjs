import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('701 official example reachable as a valid BST', () => {
  const inorder = node => (node ? [...inorder(node.left), node.value, ...inorder(node.right)] : [])
  const run = buildTrace({ root: [4, 2, 7, 1, 3], val: 5 })
  assert.deepEqual(inorder(run.root), [1, 2, 3, 4, 5, 7])
  assert.deepEqual(run.result, [4, 2, 7, 1, 3, 5])
})

// Oracle: the in-order sequence must equal the sorted values with the new one added, and every original node stays.
test('701 random BSTs keep the BST order and all existing values', () => {
  let state = 97
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rand(10) }, () => rand(30))
    const insert = (node, v) => { if (!node) return { v, l: null, r: null }; if (v < node.v) node.l = insert(node.l, v); else node.r = insert(node.r, v); return node }
    let root = null
    for (const v of values) root = insert(root, v)
    const level = [], queue = [root]
    for (let q = 0; q < queue.length; q++) { const n = queue[q]; if (n) { level.push(n.v); queue.push(n.l, n.r) } else level.push(null) }
    while (level.at(-1) === null) level.pop()
    const val = rand(40)
    const out = buildTrace({ root: level, val }).root
    const inorder = node => (node ? [...inorder(node.left), node.value, ...inorder(node.right)] : [])
    assert.deepEqual(inorder(out), [...values, val].sort((a, b) => a - b), JSON.stringify({ level, val }))
  }
})

test('701 rejects a null root', () => {
  assert.throws(() => parseInput('{"root":[null],"val":1}'))
})
