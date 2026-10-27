import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, target) => buildTrace({ arr, target }).result

test('776 official example', () => {
  assert.deepEqual(solve([4, 2, 6, 1, 3, 5, 7], 2), [[1, 2], [3, 4, 5, 6, 7]])
})

test('776 every value on one side', () => {
  assert.deepEqual(solve([5, 3, 8], 10), [[3, 5, 8], []])
  assert.deepEqual(solve([5, 3, 8], 0), [[], [3, 5, 8]])
})

test('776 rejects a tree that is not a BST', () => {
  assert.throws(() => parseInput('{"arr":[2,3,1],"target":2}'))
})

// Independent oracle: sort the values and cut at the target.
test('776 random BSTs split into the sorted halves', () => {
  let seed = 43
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 40 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const values = pool.slice(0, 1 + rnd(12))
    // Insert in the random order into a BST, then serialize it level by level.
    const insert = (node, value) => {
      if (!node) return { value, left: null, right: null }
      if (value < node.value) node.left = insert(node.left, value)
      else node.right = insert(node.right, value)
      return node
    }
    let root = null
    for (const v of values) root = insert(root, v)
    const arr = []
    const queue = [root]
    while (queue.length) {
      const node = queue.shift()
      if (!node) { arr.push(null); continue }
      arr.push(node.value)
      queue.push(node.left, node.right)
    }
    while (arr.at(-1) === null) arr.pop()
    const target = rnd(41)
    const [small, large] = solve(arr, target)
    const sorted = [...values].sort((a, b) => a - b)
    assert.deepEqual(small, sorted.filter(v => v <= target), JSON.stringify({ arr, target }))
    assert.deepEqual(large, sorted.filter(v => v > target), JSON.stringify({ arr, target }))
  }
})
