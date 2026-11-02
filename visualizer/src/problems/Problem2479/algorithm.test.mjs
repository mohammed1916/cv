import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (values, edges) => buildTrace({ values, edges }).result

test('2479 worked examples', () => {
  // Star: leaves 2, 3, 4 with sums 2, 3, 4; best disjoint XOR is 2 XOR 4 = 6 or 3 XOR 4 = 7.
  assert.equal(solve([1, 2, 3, 4], [[0, 1], [0, 2], [0, 3]]), 7)
  assert.equal(solve([1, 2, 3], [[0, 1], [1, 2]]), 0)
  assert.equal(solve([5], []), 0)
})

test('2479 frames carry subtree sums', () => {
  const run = buildTrace({ values: [1, 2, 3, 4], edges: [[0, 1], [0, 2], [0, 3]] })
  assert.equal(run.sums[0], 10)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('2479 rejects a disconnected or cyclic edge list', () => {
  assert.throws(() => parseInput('{"values":[1,2,3],"edges":[[0,1],[1,0]]}'))
  assert.throws(() => parseInput('{"values":[1,2,3],"edges":[[0,1],[0,1]]}'))
})

// Oracle: distances by Floyd-Warshall. w lies in u's subtree exactly when dist(0,w) = dist(0,u) + dist(u,w).
function oracle(values, edges) {
  const n = values.length
  const INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [a, b] of edges) { d[a][b] = 1; d[b][a] = 1 }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  const inSub = (u, w) => d[0][w] === d[0][u] + d[u][w]
  const sums = Array.from({ length: n }, (_, u) => values.reduce((s, val, w) => (inSub(u, w) ? s + val : s), 0))
  let best = 0
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) {
    if (u === v || inSub(u, v) || inSub(v, u)) continue
    best = Math.max(best, sums[u] ^ sums[v])
  }
  return best
}

test('2479 random trees match a distance-based oracle', () => {
  let seed = 2479
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const values = Array.from({ length: n }, () => 1 + rnd(50))
    const edges = Array.from({ length: n - 1 }, (_, i) => [rnd(i + 1), i + 1])
    const shuffled = edges.map(([a, b]) => (rnd(2) ? [a, b] : [b, a]))
    assert.equal(solve(values, shuffled), oracle(values, shuffled), JSON.stringify({ values, shuffled }))
  }
})
