import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3544 official examples', () => {
  assert.equal(solve({ edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], nums: [4, -8, -6, 3, 7, -2, 5], k: 2 }), 27)
  assert.equal(solve({ edges: [[0, 1], [1, 2], [2, 3], [3, 4]], nums: [-1, 3, -2, 4, -5], k: 2 }), 9)
  assert.equal(solve({ edges: [[0, 1], [0, 2]], nums: [0, -1, -2], k: 3 }), 3)
})

test('3544 with k = 1 any two chosen nodes may be related', () => {
  // Inverting the root and the leaf below it is allowed because they are 1 edge apart.
  assert.equal(solve({ edges: [[0, 1]], nums: [-3, -4], k: 1 }), 7)
})

test('3544 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"edges":[[0,1],[1,2],[2,0]],"nums":[1,2,3,4],"k":1}'))
})

// Independent oracle: try every subset of nodes, check the pairwise distance rule for every ancestor pair, and sum the signed values.
function oracle({ edges, nums, k }) {
  const n = nums.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const anc = Array.from({ length: n }, () => [])
  const dfs = (v, parent, path) => {
    anc[v] = path
    for (const w of adj[v]) if (w !== parent) dfs(w, v, [...path, v])
  }
  dfs(0, -1, [])
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    const chosen = v => (mask >> v) & 1
    let ok = true
    for (let v = 0; v < n && ok; v++) {
      if (!chosen(v)) continue
      for (const a of anc[v]) if (chosen(a) && anc[v].length - anc[a].length < k) ok = false
    }
    if (!ok) continue
    let sum = 0
    for (let v = 0; v < n; v++) {
      let flips = chosen(v)
      for (const a of anc[v]) flips += chosen(a)
      sum += flips % 2 ? -nums[v] : nums[v]
    }
    best = Math.max(best, sum)
  }
  return best
}

test('3544 random trees match a subset-enumeration oracle', () => {
  let seed = 3544
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 2 + rnd(7)
    const edges = []
    for (let i = 1; i < n; i++) edges.push(rnd(2) ? [rnd(i), i] : [i, rnd(i)])
    const nums = Array.from({ length: n }, () => rnd(19) - 9)
    const input = { edges, nums, k: 1 + rnd(4) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
