import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Independent oracle: one Dijkstra per city with a simple O(V^2) scan.
const oracle = ({ n, edges, threshold }) => {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b, w] of edges) { adj[a].push([b, w]); adj[b].push([a, w]) }
  let best = -1
  let bestCount = Infinity
  for (let s = 0; s < n; s++) {
    const d = Array(n).fill(Infinity)
    const done = Array(n).fill(false)
    d[s] = 0
    for (;;) {
      let u = -1
      for (let x = 0; x < n; x++) if (!done[x] && d[x] < Infinity && (u < 0 || d[x] < d[u])) u = x
      if (u < 0) break
      done[u] = true
      for (const [v, w] of adj[u]) d[v] = Math.min(d[v], d[u] + w)
    }
    const count = d.filter((x, j) => j !== s && x <= threshold).length
    if (best < 0 || count <= bestCount) { best = s; bestCount = count }
  }
  return best
}

const rng = seed => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

test('official examples', () => {
  assert.equal(buildTrace({ n: 4, edges: [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], threshold: 4 }).result, 3)
  assert.equal(buildTrace({ n: 5, edges: [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], threshold: 2 }).result, 0)
})

test('ties go to the larger index', () => {
  assert.equal(buildTrace({ n: 2, edges: [[0, 1, 1]], threshold: 1 }).result, 1)
})

test('matches an independent per-city Dijkstra on seeded random graphs', () => {
  const next = rng(1334)
  for (let t = 0; t < 200; t++) {
    const n = 2 + Math.floor(next() * 7)
    const pairs = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b])
    const edges = pairs.filter(() => next() < 0.4).slice(0, 12).map(([a, b]) => [a, b, 1 + Math.floor(next() * 10)])
    const input = { n, edges, threshold: Math.floor(next() * 26) }
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.equal(run.result, oracle(input), JSON.stringify(input))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,0,1]],"threshold":2}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,1],[1,0,2]],"threshold":2}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,0]],"threshold":2}'))
  assert.throws(() => parseInput('[]'))
})
