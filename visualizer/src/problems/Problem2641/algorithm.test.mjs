import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = root => buildTrace({ root }).result

test('2641 official examples', () => {
  assert.deepEqual(solve([5, 4, 9, 1, 10, null, 7]), [0, 0, 0, 7, 7, null, 11])
  assert.deepEqual(solve([3, 1, 2]), [0, 0, 0])
  assert.deepEqual(solve([1]), [0])
})

test('2641 keeps null slots in the same positions', () => {
  assert.deepEqual(solve([2, null, 3]), [0, null, 0])
})

test('2641 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('{"root":[1,101]}'), /1 to 100/)
})

// Encodes a tree back into level-order form, with the same slot convention as the input.
function encode(tree) {
  const out = [tree.value]
  const queue = [tree]
  for (let q = 0; q < queue.length; q++) {
    for (const child of [queue[q].left, queue[q].right]) {
      out.push(child ? child.value : null)
      if (child) queue.push(child)
    }
  }
  while (out[out.length - 1] === null) out.pop()
  return out
}

// Independent oracle: a node's cousins are the nodes at its depth whose parent is different.
function oracle(root) {
  const tree = treeFromLevelOrder(root)
  const entries = []
  const walk = (node, depth, parent) => {
    if (!node) return
    entries.push({ node, depth, parent })
    walk(node.left, depth + 1, node)
    walk(node.right, depth + 1, node)
  }
  walk(tree, 0, null)
  const next = entries.map(({ depth, parent }) => {
    if (parent === null) return 0
    let sum = 0
    for (const other of entries) if (other.depth === depth && other.parent !== parent) sum += other.node.value
    return sum
  })
  entries.forEach((entry, i) => { entry.node.value = next[i] })
  return encode(tree)
}

// Builds a valid level-order encoding: each queued node owns the next two slots.
function genTree(rnd, maxNodes, valueOf) {
  const arr = [valueOf()]
  const queue = [0]
  let nodes = 1
  for (let q = 0; q < queue.length; q++) {
    for (let s = 0; s < 2; s++) {
      if (nodes < maxNodes && rnd(3) > 0) { arr.push(valueOf()); queue.push(arr.length - 1); nodes++ } else arr.push(null)
    }
  }
  while (arr.length && arr[arr.length - 1] === null) arr.pop()
  return arr
}

test('2641 random trees match a cousin-pair oracle', () => {
  let seed = 2641
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const root = genTree(rnd, 1 + rnd(10), () => 1 + rnd(100))
    assert.deepEqual(solve(root), oracle(root), JSON.stringify(root))
  }
})
