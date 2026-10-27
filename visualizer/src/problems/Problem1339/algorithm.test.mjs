import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const MOD = 1000000007
const solve = tree => buildTrace(parseInput(JSON.stringify({ tree }))).result

// Independent oracle: cut each edge by removing it from an undirected graph and measure the component that holds one endpoint.
function oracle(arr) {
  const root = treeFromLevelOrder(arr)
  const nodes = []
  const edges = []
  const collect = (node, parent) => {
    if (!node) return
    nodes.push(node)
    if (parent) edges.push([parent, node])
    collect(node.left, node)
    collect(node.right, node)
  }
  collect(root, null)
  const adj = new Map(nodes.map(node => [node.id, []]))
  for (const [a, b] of edges) { adj.get(a.id).push(b); adj.get(b.id).push(a) }
  const total = nodes.reduce((sum, node) => sum + node.value, 0)
  let best = 0
  for (const [a, b] of edges) {
    const seen = new Set([a.id])
    const stack = [a]
    while (stack.length) {
      const current = stack.pop()
      for (const next of adj.get(current.id)) {
        if ((current === a && next === b) || (current === b && next === a)) continue
        if (!seen.has(next.id)) { seen.add(next.id); stack.push(next) }
      }
    }
    const part = nodes.filter(node => seen.has(node.id)).reduce((sum, node) => sum + node.value, 0)
    best = Math.max(best, part * (total - part))
  }
  return best % MOD
}

test('1339 official-style examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5, 6]), 110)
  assert.equal(solve([1, null, 2, 3, 4, null, null, 5, 6]), 90)
})

test('1339 two nodes', () => {
  assert.equal(solve([1, 2]), 2)
})

test('1339 rejects a single node', () => {
  assert.throws(() => parseInput('{"tree":[5]}'))
})

test('1339 random trees match a cut-each-edge oracle', () => {
  let seed = 1339
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = [1 + rnd(20)]
    const extra = 1 + rnd(14)
    for (let i = 1; i < extra; i++) arr.push(rnd(3) ? 1 + rnd(20) : null)
    if (arr.filter(v => v !== null).length < 2) continue
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
