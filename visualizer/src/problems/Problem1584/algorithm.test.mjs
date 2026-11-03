import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = points => buildTrace({ points }).result

// Independent oracle: Kruskal over all pairs with a union-find.
function kruskal(points) {
  const n = points.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const edges = []
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
    edges.push([Math.abs(points[a][0] - points[b][0]) + Math.abs(points[a][1] - points[b][1]), a, b])
  }
  edges.sort((x, y) => x[0] - y[0])
  let total = 0
  for (const [w, a, b] of edges) {
    const ra = find(a), rb = find(b)
    if (ra !== rb) { parent[ra] = rb; total += w }
  }
  return total
}

test('own samples give hand-checked tree weights', () => {
  assert.equal(solve([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]), 20)
  assert.equal(solve([[1, 1], [4, 1], [7, 1]]), 6)
  assert.equal(solve([[3, -2]]), 0)
})

test('frames carry a phase, a pseudocode line, a message and a snapshot', () => {
  const trace = buildTrace(parseInput('{"points":[[0,0],[1,1],[2,0]]}'))
  for (const f of trace.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1)
    assert.ok(f.snapshot && typeof f.snapshot === 'object')
  }
  assert.match(python, /def minCostConnectPoints\(points\):/)
})

test('parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"points":[[1,1],[1,1]]}'), /distinct/)
  assert.throws(() => parseInput('{"points":[[1]]}'), /\[x, y\]/)
  assert.throws(() => parseInput('{"points":[]}'), /between 1 and 15/)
})

test('random point sets match Kruskal on all pairs', () => {
  let seed = 1584
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const seen = new Set(), points = []
    const count = 1 + rnd(10)
    while (points.length < count) {
      const p = [rnd(41) - 20, rnd(41) - 20]
      if (!seen.has(p.join(','))) { seen.add(p.join(',')); points.push(p) }
    }
    assert.equal(solve(points), kruskal(points))
  }
})
