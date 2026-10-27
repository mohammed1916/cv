import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (tree, x) => buildTrace(parseInput(JSON.stringify({ tree, x }))).result

test('1145 official example: eleven nodes, x = 3', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3), true)
})

test('1145 a three-node tree leaves the second player with at most one node', () => {
  // Coloring 2 or 3 leaves the other leaf and the root on the parent side, so no region exceeds half.
  assert.equal(solve([1, 2, 3], 1), false)
})

test('1145 rejects an even node count and a bad x', () => {
  assert.throws(() => parseInput('{"tree":[1,2],"x":1}'))
  assert.throws(() => parseInput('{"tree":[1,2,3],"x":4}'))
})

// Independent oracle: remove x, then find the component of each neighbor of x by breadth-first search.
function oracle(tree, x) {
  const root = treeFromLevelOrder(tree)
  const adj = new Map()
  const nodes = []
  const addEdge = (a, b) => {
    if (!adj.has(a)) adj.set(a, [])
    if (!adj.has(b)) adj.set(b, [])
    adj.get(a).push(b)
    adj.get(b).push(a)
  }
  const walk = node => {
    if (!node) return
    nodes.push(node)
    if (!adj.has(node)) adj.set(node, [])
    if (node.left) { addEdge(node, node.left); walk(node.left) }
    if (node.right) { addEdge(node, node.right); walk(node.right) }
  }
  walk(root)
  const n = nodes.length
  const start = nodes.find(v => v.value === x)
  for (const y of adj.get(start)) {
    const seen = new Set([start, y])
    const queue = [y]
    for (let i = 0; i < queue.length; i++) {
      for (const z of adj.get(queue[i])) if (!seen.has(z)) { seen.add(z); queue.push(z) }
    }
    if (queue.length * 2 > n) return true
  }
  return false
}

test('1145 random trees match a neighbor-component oracle', () => {
  let seed = 1145
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const tree = [1]
    const extra = rnd(12)
    let next = 2
    for (let i = 0; i < extra; i++) tree.push(rnd(3) ? next++ : null)
    const x = 1 + rnd(Math.max(1, next - 1))
    // Skip arrays that parseInput rejects (unattached values, even size); the dump skips them the same way.
    try { parseInput(JSON.stringify({ tree, x })) } catch { continue }
    checked++
    assert.equal(solve(tree, x), oracle(tree, x), JSON.stringify({ tree, x }))
  }
  assert.ok(checked > 40, 'enough odd-sized trees were tested')
})
