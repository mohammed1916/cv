import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('987 official examples', () => {
  assert.deepEqual(solve([3, 9, 20, null, null, 15, 7]), [[9], [3, 15], [20], [7]])
  assert.deepEqual(solve([1, 2, 3, 4, 5, 6, 7]), [[4], [2], [1, 5, 6], [3], [7]])
  // Nodes 2 and 3 share column 1 and row 2; the smaller value comes first.
  assert.deepEqual(solve([1, 2, 3, 4, 6, 5, 7]), [[4], [2], [1, 5, 6], [3], [7]])
})

test('987 a single node', () => {
  assert.deepEqual(solve([1]), [[1]])
})

test('987 rejects a non-integer value', () => {
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: depth-first walk with explicit coordinates, then the same ordering rule.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const entries = []
  const walk = (node, col, row) => {
    if (!node) return
    entries.push([col, row, node.value])
    walk(node.left, col - 1, row + 1)
    walk(node.right, col + 1, row + 1)
  }
  walk(root, 0, 0)
  const byColumn = new Map()
  for (const [col, row, value] of entries.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2])) {
    if (!byColumn.has(col)) byColumn.set(col, [])
    byColumn.get(col).push(value)
  }
  return [...byColumn.keys()].sort((x, y) => x - y).map(col => byColumn.get(col))
}

test('987 random trees match a depth-first oracle', () => {
  let seed = 149
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [rnd(21) - 10]
    for (let i = 1; i < 1 + rnd(14); i++) arr.push(rnd(4) ? rnd(21) - 10 : null)
    assert.deepEqual(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
