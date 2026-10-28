import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, cost) => buildTrace(parseInput(JSON.stringify({ n, edges, cost }))).result

test('3593 official examples', () => {
  assert.equal(solve(3, [[0, 1], [0, 2]], [2, 1, 3]), 1)
  assert.equal(solve(3, [[0, 1], [1, 2]], [5, 1, 4]), 0)
  assert.equal(solve(5, [[0, 4], [0, 1], [1, 2], [1, 3]], [3, 4, 1, 1, 7]), 1)
})

test('3593 equal children need no change', () => {
  assert.equal(solve(3, [[0, 1], [0, 2]], [1, 4, 4]), 0)
})

test('3593 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,0]],"cost":[1,1,1]}'))
})

// Independent oracle: try every set of raised nodes and every raise amount up to 12, and keep the smallest set that equalizes all leaf paths.
function oracle(n, edges, cost) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const leafPaths = []
  const walk = (v, parent, trail) => {
    const next = adj[v].filter(w => w !== parent)
    if (next.length === 0 && v !== 0 || (v === 0 && adj[v].length === 0)) { leafPaths.push(trail); return }
    for (const w of next) walk(w, v, [...trail, w])
  }
  walk(0, -1, [0])
  const AMOUNTS = 12
  const feasible = (set) => {
    const nodes = [...set]
    const amounts = Array(nodes.length).fill(0)
    const check = () => {
      const sums = leafPaths.map(path => path.reduce((s, v) => s + cost[v] + (nodes.includes(v) ? amounts[nodes.indexOf(v)] : 0), 0))
      return sums.every(s => s === sums[0])
    }
    const tryAmounts = i => {
      if (i === nodes.length) return check()
      for (let a = 0; a <= AMOUNTS; a++) {
        amounts[i] = a
        if (tryAmounts(i + 1)) return true
      }
      return false
    }
    return tryAmounts(0)
  }
  for (let size = 0; size <= n; size++) {
    for (let mask = 0; mask < 1 << n; mask++) {
      let count = 0
      for (let v = 0; v < n; v++) if ((mask >> v) & 1) count++
      if (count !== size) continue
      const set = []
      for (let v = 0; v < n; v++) if ((mask >> v) & 1) set.push(v)
      if (feasible(set)) return size
    }
  }
  return -1
}

test('3593 small random trees match a raise-every-subset oracle', () => {
  let seed = 3593
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 40; trial++) {
    const n = 2 + rnd(3)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    const cost = Array.from({ length: n }, () => 1 + rnd(3))
    assert.equal(solve(n, edges, cost), oracle(n, edges, cost), JSON.stringify({ n, edges, cost }))
  }
})
