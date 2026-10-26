import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('653 official examples', () => {
  assert.equal(buildTrace({ root: [5, 3, 6, 2, 4, null, 7], k: 9 }).result, true)
  assert.equal(buildTrace({ root: [5, 3, 6, 2, 4, null, 7], k: 28 }).result, false)
  assert.equal(buildTrace({ root: [2, 1, 3], k: 4 }).result, true)
  assert.equal(buildTrace({ root: [1], k: 2 }).result, false)
})

test('653 random BSTs match a brute-force pair search over distinct nodes', () => {
  let state = 72
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(9)
    const values = Array.from({ length: size }, () => rand(20))
    // Build a BST from values by insertion, then serialize breadth-first for the module under test.
    const insert = (node, v) => { if (!node) return { v, l: null, r: null }; if (v < node.v) node.l = insert(node.l, v); else node.r = insert(node.r, v); return node }
    let root = null
    for (const v of values) root = insert(root, v)
    const level = []
    const queue = [root]
    for (let q = 0; q < queue.length; q++) { const n = queue[q]; if (n) { level.push(n.v); queue.push(n.l, n.r) } else level.push(null) }
    while (level.at(-1) === null) level.pop()
    const k = rand(40)
    const all = []
    const walk = n => { if (!n) return; all.push(n.v); walk(n.l); walk(n.r) }
    walk(root)
    let expected = false
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (all[i] + all[j] === k) expected = true
    assert.equal(buildTrace({ root: level, k }).result, expected, JSON.stringify({ level, k }))
  }
})

test('653 rejects a null root', () => {
  assert.throws(() => parseInput('{"root":[null],"k":1}'))
})
