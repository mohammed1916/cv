import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, price, trips) => buildTrace({ n, edges, price, trips }).result

test('2646 worked examples', () => {
  // Node 0 is used once, node 1 three times, node 2 and node 3 twice each; halving {0, 2, 3} saves the most.
  assert.equal(solve(4, [[0, 1], [1, 2], [1, 3]], [2, 2, 10, 6], [[0, 3], [2, 1], [2, 3]]), 23)
  assert.equal(solve(2, [[0, 1]], [2, 4], [[0, 1]]), 4)
})

test('2646 a single node trip is only halved when it is alone', () => {
  assert.equal(solve(3, [[0, 1], [1, 2]], [4, 4, 4], [[0, 0]]), 2)
})

test('2646 rejects an odd price', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1]],"price":[3,4],"trips":[[0,1]]}'))
})

// Independent oracle: every set of halved nodes with no two adjacent, priced directly along each trip path.
function oracle(n, edges, price, trips) {
  const adjacent = Array.from({ length: n }, () => Array(n).fill(false))
  for (const [a, b] of edges) { adjacent[a][b] = true; adjacent[b][a] = true }
  const neighbours = Array.from({ length: n }, (_, v) => Array.from({ length: n }, (_, w) => w).filter(w => adjacent[v][w]))
  const pathOf = (s, t) => {
    const back = Array(n).fill(-2)
    back[s] = -1
    const queue = [s]
    for (let q = 0; q < queue.length; q++) for (const w of neighbours[queue[q]]) if (back[w] === -2) { back[w] = queue[q]; queue.push(w) }
    const path = []
    for (let x = t; x !== -1; x = back[x]) path.push(x)
    return path
  }
  const paths = trips.map(([s, t]) => pathOf(s, t))
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let independent = true
    for (let v = 0; v < n && independent; v++) {
      for (let w = v + 1; w < n && independent; w++) {
        if (mask & (1 << v) && mask & (1 << w) && adjacent[v][w]) independent = false
      }
    }
    if (!independent) continue
    let total = 0
    for (const path of paths) for (const v of path) total += mask & (1 << v) ? price[v] / 2 : price[v]
    best = Math.min(best, total)
  }
  return best
}

test('2646 random trees match an exhaustive halving oracle', () => {
  let seed = 2646
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(6)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([i, rnd(i)])
    const price = Array.from({ length: n }, () => 2 * (1 + rnd(5)))
    const trips = Array.from({ length: 1 + rnd(3) }, () => [rnd(n), rnd(n)])
    assert.equal(solve(n, edges, price, trips), oracle(n, edges, price, trips), JSON.stringify({ n, edges, price, trips }))
  }
})
