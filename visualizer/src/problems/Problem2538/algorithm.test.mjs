import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, price) => buildTrace(parseInput(JSON.stringify({ n, edges, price }))).result

test('2538 official examples', () => {
  assert.equal(solve(6, [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]], [9, 8, 7, 6, 10, 5]), 24)
  assert.equal(solve(3, [[0, 1], [1, 2]], [1, 1, 1]), 2)
})

test('2538 a single node has cost zero', () => {
  assert.equal(solve(1, [], [5]), 0)
})

test('2538 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]],"price":[1,1,1]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2]],"price":[1,1]}'))
})

// Independent oracle: for every pair of nodes (a, b), the path sum minus the smaller endpoint price.
// Choosing the cheaper endpoint as the root maximises the cost of the path.
function oracle(n, edges, price) {
  const adjacent = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacent[a].push(b); adjacent[b].push(a) }
  let best = 0
  for (let a = 0; a < n; a++) {
    const parent = Array(n).fill(-2)
    const sum = Array(n).fill(0)
    parent[a] = -1
    sum[a] = price[a]
    const queue = [a]
    for (let q = 0; q < queue.length; q++) {
      const node = queue[q]
      for (const next of adjacent[node]) {
        if (parent[next] !== -2) continue
        parent[next] = node
        sum[next] = sum[node] + price[next]
        queue.push(next)
      }
    }
    for (let b = 0; b < n; b++) best = Math.max(best, sum[b] - Math.min(price[a], price[b]))
  }
  return best
}

test('2538 random trees match a pairwise oracle', () => {
  let seed = 2538
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const edges = Array.from({ length: n - 1 }, (_, i) => [rnd(i + 1), i + 1])
    const price = Array.from({ length: n }, () => 1 + rnd(50))
    assert.equal(solve(n, edges, price), oracle(n, edges, price), JSON.stringify({ n, edges, price }))
  }
})
