import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('623 official examples', () => {
  assert.deepEqual(buildTrace({ root: [4, 2, 6, 3, 1, 5], v: 1, d: 2 }).result, [4, 1, 1, 2, null, null, 6, 3, 1, 5])
  assert.deepEqual(buildTrace({ root: [4, 2, null, 3, 1], v: 1, d: 3 }).result, [4, 2, null, 1, 1, 3, null, null, 1])
  assert.deepEqual(buildTrace({ root: [1], v: 7, d: 1 }).result, [7, 1])
})

// Oracle: recursive insertion at depth d − 1 on a copy of the same structure.
function insertRec(node, v, d, depth) {
  if (!node) return null
  if (depth === d - 1) return { value: node.value, left: { value: v, left: node.left, right: null }, right: { value: v, left: null, right: node.right } }
  return { value: node.value, left: insertRec(node.left, v, d, depth + 1), right: insertRec(node.right, v, d, depth + 1) }
}
function toLevel(root) {
  if (!root) return []
  const out = [], queue = [root]
  for (let q = 0; q < queue.length; q++) { const n = queue[q]; if (n) { out.push(n.value); queue.push(n.left, n.right) } else out.push(null) }
  while (out.length && out.at(-1) === null) out.pop()
  return out
}

test('623 random trees match a recursive insertion oracle', () => {
  let state = 13
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(12)
    const root = Array.from({ length: size }, () => (rand(4) === 0 ? null : rand(50)))
    root[0] = root[0] ?? 1
    const v = rand(100) - 50, d = 1 + rand(5)
    const expectedTree = (() => {
      // Build the oracle tree from the same level-order array with a separate queue.
      const nodes = root.map(x => (x === null ? null : { value: x, left: null, right: null }))
      const queue = [nodes[0]]
      let c = 1
      for (let q = 0; q < queue.length && c < nodes.length; q++) {
        queue[q].left = nodes[c++]; if (queue[q].left) queue.push(queue[q].left)
        if (c < nodes.length) { queue[q].right = nodes[c++]; if (queue[q].right) queue.push(queue[q].right) }
      }
      return d === 1 ? { value: v, left: nodes[0], right: null } : insertRec(nodes[0], v, d, 1)
    })()
    assert.deepEqual(buildTrace({ root, v, d }).result, toLevel(expectedTree), JSON.stringify({ root, v, d }))
  }
})

test('623 validates depth and root', () => {
  assert.throws(() => parseInput('{"root":[1],"v":1,"d":0}'))
  assert.throws(() => parseInput('{"root":[null],"v":1,"d":2}'))
})
