import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = root => buildTrace(parseInput(JSON.stringify({ root }))).result

test('1382 official examples', () => {
  assert.deepEqual(solve([1, null, 2, null, 3, null, 4]), [2, 1, 3, null, null, null, 4])
  assert.deepEqual(solve([2, 1, 3]), [2, 1, 3])
})

test('1382 rejects a tree that is not a binary search tree', () => {
  assert.throws(() => parseInput('{"root":[2,3,1]}'), /not a binary search tree/)
})

// Independent oracle: the result must hold the same values in order and every node's subtrees differ in height by at most one.
function heightOf(node) {
  if (!node) return 0
  return 1 + Math.max(heightOf(node.left), heightOf(node.right))
}
function isBalanced(node) {
  if (!node) return true
  return Math.abs(heightOf(node.left) - heightOf(node.right)) <= 1 && isBalanced(node.left) && isBalanced(node.right)
}
function inorderValues(node, out = []) {
  if (!node) return out
  inorderValues(node.left, out)
  out.push(node.value)
  inorderValues(node.right, out)
  return out
}

test('1382 seeded random trees are balanced and keep their values', () => {
  let seed = 1382
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const set = new Set()
    const count = 1 + rnd(10)
    while (set.size < count) set.add(1 + rnd(50))
    // Insert in a random order so the input tree shape varies.
    const values = [...set]
    let tree = null
    const insert = (node, v) => {
      if (!node) return { value: v, left: null, right: null }
      if (v < node.value) node.left = insert(node.left, v)
      else node.right = insert(node.right, v)
      return node
    }
    for (const v of values) tree = insert(tree, v)
    const out = []
    const queue = [tree]
    for (let q = 0; q < queue.length; q++) {
      const node = queue[q]
      if (!node) { out.push(null); continue }
      out.push(node.value)
      queue.push(node.left, node.right)
    }
    while (out.length && out[out.length - 1] === null) out.pop()
    if (out.length > 31) continue
    const result = solve(out)
    const balanced = treeFromLevelOrder(result)
    assert.ok(isBalanced(balanced), JSON.stringify(out))
    assert.deepEqual(inorderValues(balanced), [...set].sort((a, b) => a - b), JSON.stringify(out))
  }
})
