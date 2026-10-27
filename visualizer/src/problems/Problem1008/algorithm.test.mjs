import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { levelOrderFromTree } from '../../components/shared/treeLayout.js'

const solve = preorder => buildTrace({ preorder }).result

test('1008 official examples', () => {
  assert.deepEqual(solve([8, 5, 1, 7, 10, 12]), [8, 5, 10, 1, 7, null, 12])
  assert.deepEqual(solve([1, 3]), [1, null, 3])
})

test('1008 edge cases', () => {
  assert.deepEqual(solve([5]), [5])
  // Trailing nulls from the last level are trimmed.
  assert.deepEqual(solve([5, 3, 2, 6]), [5, 3, 6, 2])
  // A strictly decreasing preorder builds a left-leaning chain.
  assert.deepEqual(solve([4, 3, 2, 1]), [4, 3, null, 2, null, 1])
})

test('1008 rejects duplicates, out-of-range values and empty input', () => {
  assert.throws(() => parseInput('{"preorder":[2,1,2]}'), /distinct/)
  assert.throws(() => parseInput('{"preorder":[0,1]}'), /1 to 100/)
  assert.throws(() => parseInput('{"preorder":[]}'), /1 to 12/)
})

// Standard BST insertion of each value in the given order.
function oracleTree(values) {
  let root = null
  for (const value of values) {
    const node = { value, left: null, right: null }
    if (!root) {
      root = node
      continue
    }
    let cur = root
    let side = value < cur.value ? 'left' : 'right'
    while (cur[side]) {
      cur = cur[side]
      side = value < cur.value ? 'left' : 'right'
    }
    cur[side] = node
  }
  return root
}

// Independent oracle: insert the preorder values into an empty BST, then serialize.
function oracle(preorder) {
  return levelOrderFromTree(oracleTree(preorder))
}

test('1008 random preorders match a standard BST insertion oracle', () => {
  let seed = 829
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(12)
    const pool = new Set()
    while (pool.size < size) pool.add(1 + rnd(100))
    // Only real BST preorders are valid input, so insert the random values into a tree and take its preorder.
    const tree = oracleTree([...pool])
    const preorder = []
    const walk = node => {
      if (!node) return
      preorder.push(node.value)
      walk(node.left)
      walk(node.right)
    }
    walk(tree)
    assert.deepEqual(solve(preorder), oracle(preorder), JSON.stringify(preorder))
  }
})
