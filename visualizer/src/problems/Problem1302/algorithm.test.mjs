import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('1302 official examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, null, 6, 7, null, null, null, null, 8]), 15)
  assert.equal(solve([6, 7, 8, 2, 7, 1, 3, 9, null, 1, 4, null, null, null, 5]), 19)
})

test('1302 a single root and a value outside 1 to 100', () => {
  assert.equal(solve([42]), 42)
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[101]'))
})

// Independent oracle: record each node's depth in a depth-first walk, then sum the deepest ones.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const sums = new Map()
  let deepest = -1
  const walk = (node, d) => {
    if (!node) return
    if (d > deepest) deepest = d
    sums.set(d, (sums.get(d) || 0) + node.value)
    walk(node.left, d + 1)
    walk(node.right, d + 1)
  }
  walk(root, 0)
  return sums.get(deepest)
}

test('1302 random trees match a depth-first oracle', () => {
  let seed = 1302
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [1 + rnd(100)]
    for (let i = 0; i < 1 + rnd(14); i++) arr.push(rnd(4) ? 1 + rnd(100) : null)
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
