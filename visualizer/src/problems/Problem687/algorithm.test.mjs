import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('687 official examples', () => {
  assert.equal(buildTrace([5, 4, 5, 1, 1, null, 5]).result, 2)
  assert.equal(buildTrace([1, 4, 5, 4, 4, null, 5]).result, 2)
  assert.equal(buildTrace([1]).result, 0)
})

// Oracle: every pair of nodes; the path between them (found by BFS in the tree) is univalue?
test('687 random trees match a pairwise path oracle', () => {
  let state = 17
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(10)
    const values = Array.from({ length: size }, () => (rand(4) === 0 ? null : rand(3)))
    values[0] = values[0] ?? 0
    const nodes = values.map((v, i) => (v === null ? null : { i, v, adj: [] }))
    const queue = [nodes[0]]
    let c = 1
    const link = (a, b) => { a.adj.push(b); b.adj.push(a) }
    for (let q = 0; q < queue.length && c < nodes.length; q++) {
      const parent = queue[q]
      const l = nodes[c++]
      if (l) { link(parent, l); queue.push(l) }
      if (c < nodes.length) { const r = nodes[c++]; if (r) { link(parent, r); queue.push(r) } }
    }
    const live = nodes.filter(Boolean)
    let expected = 0
    for (const s of live) {
      const dist = new Map([[s, 0]])
      const q2 = [s]
      for (let k = 0; k < q2.length; k++) {
        const x = q2[k]
        for (const y of x.adj) if (!dist.has(y) && y.v === s.v) { dist.set(y, dist.get(x) + 1); q2.push(y) }
      }
      for (const d of dist.values()) expected = Math.max(expected, d)
    }
    assert.equal(buildTrace(values).result, expected, JSON.stringify(values))
  }
})

test('687 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
