import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = root => buildTrace(parseInput(JSON.stringify({ root }))).result

test('1038 official example', () => {
  assert.deepEqual(
    solve([4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]),
    [30, 36, 21, 36, 35, 26, 15, null, null, null, 33, null, null, null, 8],
  )
})

test('1038 rejects a tree with a repeated value', () => {
  assert.throws(() => parseInput('{"root":[2,1,1]}'), /binary search tree/)
})

// Independent oracle: sum the values at least as large as each value, then rewrite the level array.
function oracle(values) {
  const present = values.filter(v => v !== null)
  return values.map(v => (v === null ? null : present.filter(x => x >= v).reduce((a, b) => a + b, 0)))
}

// Builds a level-order array by inserting distinct values into a binary search tree.
function bstArray(values) {
  let root = null
  const insert = (node, v) => {
    if (!node) return { v, l: null, r: null }
    if (v < node.v) node.l = insert(node.l, v)
    else node.r = insert(node.r, v)
    return node
  }
  for (const v of values) root = insert(root, v)
  const out = []
  const queue = [root]
  for (let q = 0; q < queue.length; q++) {
    const node = queue[q]
    if (!node) { out.push(null); continue }
    out.push(node.v)
    queue.push(node.l, node.r)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('1038 seeded random trees match the sum oracle', () => {
  let seed = 1038
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const set = new Set()
    const count = 1 + rnd(10)
    while (set.size < count) set.add(rnd(31))
    const values = bstArray([...set])
    if (values.length > 15) continue
    const expected = oracle(values)
    const actual = solve(values)
    assert.deepEqual(actual, expected, JSON.stringify(values))
    assert.ok(treeFromLevelOrder(actual) !== null)
  }
})
