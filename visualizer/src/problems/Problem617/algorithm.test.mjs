import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('617 official example', () => {
  assert.deepEqual(buildTrace({ a: [1, 3, 2, 5], b: [2, 1, 3, null, 4, null, 7] }).result, [3, 4, 5, 5, 4, null, 7])
  assert.deepEqual(buildTrace({ a: [1], b: [1, 2] }).result, [2, 2])
  assert.deepEqual(buildTrace({ a: [], b: [] }).result, [])
})

// Oracle: a node sits at a heap position (root 1, children 2p and 2p+1). The merge
// must give every position present in either tree the sum of values found there.
function heapMap(root) {
  const map = new Map()
  const walk = (node, p) => { if (!node) return; map.set(p, node.value); walk(node.left, 2 * p); walk(node.right, 2 * p + 1) }
  walk(root, 1)
  return map
}

// Builds a tree object from a LeetCode array with a queue, independently of the module under test.
function parseTree(values) {
  if (!values.length || values[0] === null) return null
  const nodes = values.map(v => (v === null ? null : { value: v, left: null, right: null }))
  const queue = [nodes[0]]
  let cursor = 1
  for (let q = 0; q < queue.length && cursor < nodes.length; q++) {
    queue[q].left = nodes[cursor++]
    if (queue[q].left) queue.push(queue[q].left)
    if (cursor < nodes.length) { queue[q].right = nodes[cursor++]; if (queue[q].right) queue.push(queue[q].right) }
  }
  return nodes[0]
}

test('617 random trees match a heap-position sum oracle', () => {
  let state = 41
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const make = () => {
    const size = rand(8)
    const arr = Array.from({ length: size }, () => (rand(4) === 0 ? null : rand(20)))
    if (arr.length && arr[0] === null) arr[0] = 1
    return arr
  }
  for (let t = 0; t < 300; t++) {
    const a = make(), b = make()
    const ma = heapMap(parseTree(a)), mb = heapMap(parseTree(b))
    const expected = new Map()
    for (const p of new Set([...ma.keys(), ...mb.keys()])) expected.set(p, (ma.get(p) ?? 0) + (mb.get(p) ?? 0))
    assert.deepEqual(heapMap(buildTrace({ a, b }).root), expected, JSON.stringify({ a, b }))
  }
})

test('617 rejects a null root', () => {
  assert.throws(() => parseInput('{"a":[null],"b":[]}'))
})
