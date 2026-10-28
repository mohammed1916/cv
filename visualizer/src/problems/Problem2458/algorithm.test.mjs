import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (root, queries) => buildTrace(parseInput(JSON.stringify({ root, queries }))).result

test('2458 worked examples', () => {
  // Tree: 1 has children 2 and 3; 2 has children 4 and 5.
  assert.deepEqual(solve([1, 2, 3, 4, 5], [2]), [2])
  assert.deepEqual(solve([1, 2, 3, 4, 5], [4]), [3])
  assert.deepEqual(solve([1, 2, 3, 4, 5], [2, 4, 3, 1]), [2, 3, 3, 0])
})

test('2458 a path keeps the height of what remains', () => {
  // A chain 1 - 2 - 3: removing 2 leaves only 1, and removing 3 leaves 1 and 2.
  assert.deepEqual(solve([1, null, 2, null, 3], [2, 3]), [1, 2])
})

test('2458 rejects duplicate values and out-of-range queries', () => {
  assert.throws(() => parseInput('{"root":[1,2,2],"queries":[1]}'))
  assert.throws(() => parseInput('{"root":[1,2,3],"queries":[4]}'))
})

// Independent oracle: remove each queried subtree and measure the height of what is left, from scratch.
function heightWithout(node, removed) {
  if (!node || node.value === removed) return 0
  return 1 + Math.max(heightWithout(node.left, removed), heightWithout(node.right, removed))
}

// Builds a random tree with exactly count nodes by splitting the remaining count between the two children.
function grow(count, rnd) {
  if (count === 0) return null
  const rest = count - 1
  const leftCount = rnd(rest + 1)
  return { value: 0, left: grow(leftCount, rnd), right: grow(rest - leftCount, rnd) }
}

function toLevelOrder(root) {
  const out = []
  const queue = [root]
  while (queue.length) {
    const n = queue.shift()
    if (n === null) { out.push(null); continue }
    out.push(n.value)
    queue.push(n.left, n.right)
  }
  while (out.length && out[out.length - 1] === null) out.pop()
  return out
}

test('2458 random trees match a remove-and-measure oracle', () => {
  let seed = 2458
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const shape = grow(n, rnd)
    const bfs = []
    const queue = [shape]
    while (queue.length) { const x = queue.shift(); if (x) { bfs.push(x); queue.push(x.left, x.right) } }
    const values = bfs.map((_, i) => i + 1)
    for (let i = values.length - 1; i > 0; i--) { const j = rnd(i + 1); [values[i], values[j]] = [values[j], values[i]] }
    bfs.forEach((x, i) => { x.value = values[i] })
    const root = toLevelOrder(shape)
    const queries = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(n))
    const tree = treeFromLevelOrder(root)
    const expected = queries.map(q => heightWithout(tree, q))
    assert.deepEqual(solve(root, queries), expected, JSON.stringify({ root, queries }))
  }
})
