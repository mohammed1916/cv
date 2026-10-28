import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, coins, k) => buildTrace(parseInput(JSON.stringify({ n, edges, coins, k }))).result

test('2920 official examples', () => {
  assert.equal(solve(4, [[0, 1], [1, 2], [2, 3]], [10, 10, 3, 3], 5), 11)
  assert.equal(solve(3, [[0, 1], [0, 2]], [8, 4, 4], 0), 16)
})

test('2920 a path of two nodes', () => {
  // Keep both: (4 - 1) + (3 - 1) = 5. Halve the root: 2 + (1 - 1) = 2. Keeping is better.
  assert.equal(solve(2, [[0, 1]], [4, 3], 1), 5)
})

test('2920 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]],"coins":[1,1,1],"k":0}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1]],"coins":[1],"k":0}'))
})

// Independent oracle: enumerate every keep/halve assignment for the nodes, then score it directly.
function oracle(n, edges, coins, k) {
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  const parent = Array(n).fill(-1)
  const seen = new Set([0])
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    for (const next of adjacent[queue[q]]) if (!seen.has(next)) { seen.add(next); parent[next] = queue[q]; queue.push(next) }
  }
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let total = 0
    for (let v = 0; v < n; v++) {
      let h = 0
      for (let p = parent[v]; p !== -1; p = parent[p]) if (mask & (1 << p)) h += 1
      const cur = Math.floor(coins[v] / 2 ** h)
      total += mask & (1 << v) ? Math.floor(cur / 2) : cur - k
    }
    best = Math.max(best, total)
  }
  return best
}

test('2920 random trees match an assignment-enumeration oracle', () => {
  let seed = 2920
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(7)
    const edges = Array.from({ length: n - 1 }, (_, i) => [rnd(i + 1), i + 1])
    const coins = Array.from({ length: n }, () => rnd(100))
    const k = rnd(20)
    assert.equal(solve(n, edges, coins, k), oracle(n, edges, coins, k), JSON.stringify({ n, edges, coins, k }))
  }
})
