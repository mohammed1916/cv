import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1489 official examples', () => {
  assert.deepEqual(solve({ n: 5, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]] }), [[0, 1], [2, 3, 4, 5]])
  assert.deepEqual(solve({ n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 1]] }), [[], [0, 1, 2, 3]])
})

test('1489 rejects a disconnected graph', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,1]]}'), /connected/)
})

// Independent oracle: enumerate every set of n - 1 edges, keep the spanning trees, and classify each edge
// by how many minimum spanning trees contain it.
function oracle({ n, edges }) {
  const m = edges.length
  const isTree = subset => {
    const parent = Array.from({ length: n }, (_, i) => i)
    const find = x => (parent[x] === x ? x : find(parent[x]))
    for (const i of subset) {
      const [a, b] = edges[i]
      const ra = find(a)
      const rb = find(b)
      if (ra === rb) return false
      parent[ra] = rb
    }
    return true
  }
  const trees = []
  for (let mask = 0; mask < 1 << m; mask++) {
    const subset = []
    for (let i = 0; i < m; i++) if (mask & (1 << i)) subset.push(i)
    if (subset.length === n - 1 && isTree(subset)) trees.push(subset)
  }
  const best = Math.min(...trees.map(t => t.reduce((s, i) => s + edges[i][2], 0)))
  const minTrees = trees.filter(t => t.reduce((s, i) => s + edges[i][2], 0) === best)
  const critical = []
  const pseudo = []
  for (let i = 0; i < m; i++) {
    const count = minTrees.filter(t => t.includes(i)).length
    if (count === minTrees.length) critical.push(i)
    else if (count > 0) pseudo.push(i)
  }
  return [critical, pseudo]
}

test('1489 random connected graphs match a spanning-tree enumeration oracle', () => {
  let seed = 1489
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  let checked = 0
  for (let t = 0; t < 400; t++) {
    const n = 2 + rnd(4)
    const m = 1 + rnd(7)
    const edges = []
    for (let i = 0; i < m; i++) {
      const a = rnd(n)
      let b = rnd(n)
      if (b === a) b = (a + 1) % n
      edges.push([a, b, 1 + rnd(4)])
    }
    try { parseInput(JSON.stringify({ n, edges })) } catch { continue }
    checked++
    assert.deepEqual(solve({ n, edges }), oracle({ n, edges }), JSON.stringify({ n, edges }))
  }
  assert.ok(checked > 100)
})
