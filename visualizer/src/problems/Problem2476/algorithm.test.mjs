import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (root, queries) => buildTrace({ root, queries }).result

test('2476 official example', () => {
  const root = [6, 2, 13, 1, 4, 9, 15, null, null, null, null, null, null, 14]
  assert.deepEqual(solve(root, [2, 5, 16]), [[2, 2], [4, 6], [15, -1]])
})

test('2476 queries below and above every value', () => {
  assert.deepEqual(solve([4, 2, 6], [1, 7]), [[-1, 2], [6, -1]])
})

test('2476 rejects a tree that is not a binary search tree', () => {
  assert.throws(() => parseInput('{"root":[4,6,2],"queries":[1]}'))
})

// Independent oracle: look only at the list of values, never at the tree shape.
function oracle(root, queries) {
  const values = root.filter(v => v !== null)
  return queries.map(q => {
    let low = -1
    let high = -1
    for (const v of values) {
      if (v <= q && v > low) low = v
      if (v >= q && (high === -1 || v < high)) high = v
    }
    return [low, high]
  })
}

test('2476 random binary search trees match a value-list oracle', () => {
  let seed = 2476
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const pool = new Set()
    const size = 1 + rnd(8)
    while (pool.size < size) pool.add(rnd(40))
    let root = null
    const insert = (tree, v) => {
      if (!tree) return { v, l: null, r: null }
      if (v < tree.v) tree.l = insert(tree.l, v)
      else tree.r = insert(tree.r, v)
      return tree
    }
    for (const v of pool) root = insert(root, v)
    const arr = []
    const queue = [root]
    while (queue.length) {
      const cur = queue.shift()
      if (!cur) { arr.push(null); continue }
      arr.push(cur.v)
      queue.push(cur.l, cur.r)
    }
    while (arr[arr.length - 1] === null) arr.pop()
    const queries = Array.from({ length: 1 + rnd(5) }, () => rnd(42))
    assert.deepEqual(solve(arr, queries), oracle(arr, queries), JSON.stringify({ arr, queries }))
  }
})
