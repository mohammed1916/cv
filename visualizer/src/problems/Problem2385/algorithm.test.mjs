import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'
import { treeFromLevelOrder } from '../../components/shared/treeLayout.js'

const solve = (root, start) => buildTrace({ root, start }).result

test('2385 official examples', () => {
  assert.equal(solve([1, 5, 3, null, 4, 10, 6, 9, 2], 3), 4)
  assert.equal(solve([1], 1), 0)
  assert.equal(solve([1, 2, null, 3, null, 4, null, 5], 3), 2)
})

test('2385 edge case: a start at a leaf reaches the far side of the root', () => {
  // Start at 7 (a left leaf under 2): 7-2-1-3 reaches node 3 after 3 minutes.
  assert.equal(solve([1, 2, 3, 7], 7), 3)
})

test('2385 rejects duplicate values and a missing start', () => {
  assert.throws(() => parseInput('{"root":[1,2,2],"start":1}'), /distinct/)
  assert.throws(() => parseInput('{"root":[1,2,3],"start":9}'), /start/)
})

// Independent oracle: Floyd-Warshall over the tree edges, then the largest distance from the start.
function oracle(root, start) {
  const tree = treeFromLevelOrder(root)
  const nodes = []
  const collect = node => { if (!node) return; nodes.push(node); collect(node.left); collect(node.right) }
  collect(tree)
  const index = new Map(nodes.map((node, i) => [node, i]))
  const n = nodes.length
  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const node of nodes) {
    for (const child of [node.left, node.right]) {
      if (!child) continue
      dist[index.get(node)][index.get(child)] = 1
      dist[index.get(child)][index.get(node)] = 1
    }
  }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
  const from = nodes.find(node => node.value === start)
  return Math.max(...dist[index.get(from)])
}

// Builds a valid level-order encoding: each queued node owns the next two slots.
function genTree(rnd, maxNodes, valueOf) {
  const arr = [valueOf()]
  const queue = [0]
  let nodes = 1
  for (let q = 0; q < queue.length; q++) {
    for (let s = 0; s < 2; s++) {
      if (nodes < maxNodes && rnd(3) > 0) { arr.push(valueOf()); queue.push(arr.length - 1); nodes++ } else arr.push(null)
    }
  }
  while (arr.length && arr[arr.length - 1] === null) arr.pop()
  return arr
}

test('2385 random trees match a Floyd-Warshall oracle', () => {
  let seed = 2385
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const pool = Array.from({ length: 40 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const root = genTree(rnd, 7, () => pool.pop())
    const values = root.filter(v => v !== null)
    const start = values[rnd(values.length)]
    assert.equal(solve(root, start), oracle(root, start), JSON.stringify({ root, start }))
  }
})
