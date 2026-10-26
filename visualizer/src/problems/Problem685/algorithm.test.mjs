import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('685 official examples', () => {
  assert.deepEqual(buildTrace([[1, 2], [1, 3], [2, 3]]).result, [2, 3])
  assert.deepEqual(buildTrace([[1, 2], [2, 3], [3, 4], [4, 1], [1, 5]]).result, [4, 1])
})

// Oracle: remove each edge in turn; a valid answer leaves a rooted tree on all n nodes (one root,
// every other node with exactly one parent, everything reachable from the root). Return the last valid edge.
function isRootedTree(n, edges) {
  const parents = Array(n + 1).fill(0)
  for (const [, v] of edges) parents[v]++
  if (parents.slice(1).some(p => p > 1)) return false
  const roots = []
  for (let v = 1; v <= n; v++) if (parents[v] === 0) roots.push(v)
  if (roots.length !== 1) return false
  const children = Array.from({ length: n + 1 }, () => [])
  for (const [u, v] of edges) children[u].push(v)
  const seen = new Set()
  const stack = [roots[0]]
  while (stack.length) { const x = stack.pop(); if (seen.has(x)) return false; seen.add(x); stack.push(...children[x]) }
  return seen.size === n
}

test('685 random graphs match removal-and-check oracle', () => {
  let state = 61
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 400; t++) {
    const n = 3 + rand(4)
    // Start from a random rooted tree on n nodes, then add one extra edge.
    const tree = []
    for (let v = 2; v <= n; v++) tree.push([1 + rand(v - 1), v])
    const extra = [1 + rand(n), 1 + rand(n)]
    if (extra[0] === extra[1]) continue
    const edges = [...tree]
    edges.splice(rand(edges.length + 1), 0, extra)
    let expected = null
    for (let i = 0; i < edges.length; i++) if (isRootedTree(n, edges.filter((_, j) => j !== i))) expected = edges[i]
    if (expected === null) continue
    assert.deepEqual(buildTrace(edges).result, expected, JSON.stringify(edges))
  }
})

test('685 rejects self-loops', () => {
  assert.throws(() => parseInput('[[1,1],[1,2],[2,3]]'))
})
