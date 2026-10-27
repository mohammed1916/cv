import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Independent oracle: try every set of kept nodes, keep the healthy ones, and maximize the zeroed total.
function oracle({ edges, values }) {
  const n = values.length
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const parent = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    for (const c of adj[queue[q]]) if (!seen[c]) { seen[c] = true; parent[c] = queue[q]; queue.push(c) }
  }
  const hasChild = Array(n).fill(false)
  for (let v = 1; v < n; v++) hasChild[parent[v]] = true
  const leaves = [...Array(n).keys()].filter(v => !hasChild[v])
  const total = values.reduce((a, b) => a + b, 0)
  let best = -1
  for (let mask = 0; mask < 1 << n; mask++) {
    const healthy = leaves.every(leaf => {
      let sum = 0
      for (let v = leaf; v !== -1; v = parent[v]) if (mask & (1 << v)) sum += values[v]
      return sum > 0
    })
    if (!healthy) continue
    let kept = 0
    for (let v = 0; v < n; v++) if (mask & (1 << v)) kept += values[v]
    best = Math.max(best, total - kept)
  }
  return best
}

test('2925 small trees', () => {
  assert.equal(solve({ edges: [[0, 1]], values: [1, 2] }), 2)
  assert.equal(solve({ edges: [[0, 1], [0, 2]], values: [5, 1, 1] }), 5)
  assert.equal(solve({ edges: [[0, 1], [1, 2]], values: [1, 1, 1] }), 2)
})

test('2925 rejects a value outside 1 to 20', () => {
  assert.throws(() => parseInput('{"edges":[[0,1]],"values":[0,2]}'))
})

test('2925 random trees match a brute-force oracle', () => {
  let seed = 2925
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let i = 1; i < n; i++) {
      const parent = rnd(i)
      edges.push(rnd(2) ? [parent, i] : [i, parent])
    }
    const values = Array.from({ length: n }, () => 1 + rnd(9))
    const input = { edges, values }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
