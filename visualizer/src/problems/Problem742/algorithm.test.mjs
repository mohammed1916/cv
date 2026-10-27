import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, reachableValues } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

test('742 official examples', () => {
  // Both leaves are one step from the root; the left one is dequeued first.
  assert.equal(buildTrace({ arr: [1, 3, 2], k: 1 }).result, 3)
  assert.equal(buildTrace({ arr: [1], k: 1 }).result, 1)
  // From 2, leaves 3 and 5 are both two steps away; the search reaches 5 first.
  assert.equal(buildTrace({ arr: [1, 2, 3, 4, null, null, null, 5], k: 2 }).result, 5)
})

test('742 rejects a target that is not in the tree', () => {
  assert.throws(() => parseInput('{"arr":[1,2],"k":9}'))
  // 5 sits after a missing child, so the tree never places it.
  assert.throws(() => parseInput('{"arr":[1,null,2,null,null,5],"k":5}'))
})

// Independent oracle: distance = depth(a) + depth(b) - 2 * depth(lowest common ancestor), over every leaf.
function distanceTable(arr) {
  const root = treeFromLevelOrder(arr)
  const parent = new Map(), depth = new Map(), nodes = []
  const walk = (node, p, d) => {
    if (!node) return
    parent.set(node, p)
    depth.set(node, d)
    nodes.push(node)
    walk(node.left, node, d + 1)
    walk(node.right, node, d + 1)
  }
  walk(root, null, 0)
  const distance = (a, b) => {
    const above = new Set()
    for (let x = a; x; x = parent.get(x)) above.add(x)
    let x = b
    while (!above.has(x)) x = parent.get(x)
    return depth.get(a) + depth.get(b) - 2 * depth.get(x)
  }
  return { nodes, distance }
}

test('742 random trees return a leaf at the minimum distance', () => {
  let seed = 53
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(15)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const arr = [pool[0]]
    for (let i = 1; i < size * 2; i++) arr.push(rnd(3) ? pool[i] : null)
    const values = reachableValues(arr)
    const k = values[rnd(values.length)]
    const { nodes, distance } = distanceTable(arr)
    const target = nodes.find(n => n.value === k)
    const best = Math.min(...nodes.filter(n => !n.left && !n.right).map(leaf => distance(target, leaf)))
    const found = buildTrace({ arr, k }).result
    const leaf = nodes.find(n => n.value === found)
    assert.ok(!leaf.left && !leaf.right, `${found} is a leaf`)
    assert.equal(distance(target, leaf), best, JSON.stringify({ arr, k }))
  }
})
