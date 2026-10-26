import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('669 official examples', () => {
  assert.deepEqual(buildTrace({ root: [1, 0, 2], low: 1, high: 2 }).result, [1, null, 2])
  assert.deepEqual(buildTrace({ root: [3, 0, 4, null, 2, null, null, 1], low: 1, high: 3 }).result, [3, 2, null, 1])
})

// Oracle: the in-order values of the trimmed tree must be exactly the input values inside [low, high].
test('669 random BSTs keep exactly the in-range values in order', () => {
  let state = 81
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const values = Array.from({ length: 1 + rand(10) }, () => rand(20))
    const insert = (node, v) => { if (!node) return { v, l: null, r: null }; if (v < node.v) node.l = insert(node.l, v); else node.r = insert(node.r, v); return node }
    let root = null
    for (const v of values) root = insert(root, v)
    const level = [], queue = [root]
    for (let q = 0; q < queue.length; q++) { const n = queue[q]; if (n) { level.push(n.v); queue.push(n.l, n.r) } else level.push(null) }
    while (level.at(-1) === null) level.pop()
    const low = rand(20), high = low + rand(10)
    const { root: trimmed } = buildTrace({ root: level, low, high })
    const inorder = []
    const walk = n => { if (!n) return; walk(n.left); inorder.push(n.value); walk(n.right) }
    walk(trimmed)
    const expected = values.filter(v => v >= low && v <= high).sort((a, b) => a - b)
    assert.deepEqual(inorder, expected, JSON.stringify({ level, low, high }))
  }
})

test('669 rejects low greater than high', () => {
  assert.throws(() => parseInput('{"root":[1],"low":3,"high":2}'))
})
