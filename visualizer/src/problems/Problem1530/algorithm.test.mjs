import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (tree, distance) => buildTrace(parseInput(JSON.stringify({ tree, distance }))).result

test('1530 official examples', () => {
  assert.equal(solve([1, 2, 3, null, 4], 3), 1)
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7], 3), 2)
  assert.equal(solve([7, 1, 4, 6, null, 5, 3, null, null, null, null, null, 2], 3), 1)
})

test('1530 a single leaf has no pairs', () => {
  assert.equal(solve([5], 10), 0)
})

test('1530 rejects a distance outside 1 to 10', () => {
  assert.throws(() => parseInput('{"tree":[1,2,3],"distance":11}'))
})

// Independent oracle: list the leaves, then compute every pairwise distance with breadth-first search.
function oracle(tree, distance) {
  const root = treeFromLevelOrder(tree)
  const adj = new Map()
  const leaves = []
  const link = (a, b) => {
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a).push(b)
    adj.get(b).push(a)
  }
  const walk = node => {
    if (!node) return
    if (!adj.has(node)) adj.set(node, [])
    if (!node.left && !node.right) leaves.push(node)
    if (node.left) { link(node, node.left); walk(node.left) }
    if (node.right) { link(node, node.right); walk(node.right) }
  }
  walk(root)
  const dist = (from, to) => {
    const seen = new Map([[from, 0]])
    const queue = [from]
    for (let i = 0; i < queue.length; i++) {
      const cur = queue[i]
      if (cur === to) return seen.get(cur)
      for (const z of adj.get(cur)) if (!seen.has(z)) { seen.set(z, seen.get(cur) + 1); queue.push(z) }
    }
    return Infinity
  }
  let count = 0
  for (let i = 0; i < leaves.length; i++) {
    for (let j = i + 1; j < leaves.length; j++) if (dist(leaves[i], leaves[j]) <= distance) count++
  }
  return count
}

test('1530 random trees match a pairwise-distance oracle', () => {
  let seed = 1530
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 300; t++) {
    const tree = [1 + rnd(9)]
    const extra = rnd(13)
    for (let i = 0; i < extra; i++) tree.push(rnd(4) ? 1 + rnd(9) : null)
    const distance = 1 + rnd(10)
    try { parseInput(JSON.stringify({ tree, distance })) } catch { continue }
    checked++
    assert.equal(solve(tree, distance), oracle(tree, distance), JSON.stringify({ tree, distance }))
  }
  assert.ok(checked > 100)
})
