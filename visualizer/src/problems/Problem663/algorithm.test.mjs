import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = arr => buildTrace(arr).result

test('663 official examples', () => {
  assert.equal(solve([5, 10, 10, null, null, 2, 3]), true)
  assert.equal(solve([1, 2, 10]), false)
})

test('663 rejects a null root', () => {
  assert.throws(() => parseInput('[null,1]'))
})

// Independent oracle: cut each edge in turn and compare the two components by walking them.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const nodes = []
  const edges = []
  const collect = node => {
    if (!node) return
    nodes.push(node)
    for (const child of [node.left, node.right]) {
      if (child) edges.push([node.id, child.id])
      collect(child)
    }
  }
  collect(root)
  const value = new Map(nodes.map(node => [node.id, node.value]))
  const total = nodes.reduce((sum, node) => sum + node.value, 0)
  return edges.some(([parent, child]) => {
    // Component of `child` after removing the edge parent-child.
    const seen = new Set([child])
    const queue = [child]
    while (queue.length) {
      const id = queue.shift()
      for (const [a, b] of edges) {
        if (a === parent && b === id) continue
        if (a === id && !seen.has(b) && !(a === parent && b === child)) { seen.add(b); queue.push(b) }
        if (b === id && !seen.has(a) && !(a === parent && b === child)) { seen.add(a); queue.push(a) }
      }
    }
    const below = [...seen].reduce((sum, id) => sum + value.get(id), 0)
    return below * 2 === total
  })
}

test('663 random trees match an edge-cutting oracle', () => {
  let seed = 5
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  let yes = 0
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    const arr = [rnd(3)]
    for (let i = 1; i < len; i++) arr.push(rnd(4) ? rnd(3) : null)
    // Children of a missing node are missing, so the array stays a valid level order.
    for (let i = 1; i < arr.length; i++) if (arr[i] !== null && arr[(i - 1) >> 1] === null) arr[i] = null
    const expected = oracle(arr)
    assert.equal(solve(arr), expected, JSON.stringify(arr))
    if (expected) yes++
  }
  assert.ok(yes > 20)
})
