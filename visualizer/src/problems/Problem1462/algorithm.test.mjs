import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

// Independent oracle: a depth-first search from each query's first course.
const oracle = ({ n, prerequisites, queries }) => {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of prerequisites) adj[a].push(b)
  const reachable = (s, t) => {
    const stack = [s]
    const seen = new Set()
    while (stack.length) {
      const u = stack.pop()
      for (const v of adj[u]) { if (v === t) return true; if (!seen.has(v)) { seen.add(v); stack.push(v) } }
    }
    return false
  }
  return queries.map(([u, v]) => reachable(u, v))
}

const rng = seed => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

test('official examples', () => {
  assert.deepEqual(buildTrace({ n: 2, prerequisites: [[1, 0]], queries: [[0, 1], [1, 0]] }).result, [false, true])
  assert.deepEqual(buildTrace({ n: 3, prerequisites: [[1, 2], [1, 0], [2, 0]], queries: [[1, 0], [1, 2]] }).result, [true, true])
  assert.deepEqual(buildTrace({ n: 5, prerequisites: [[0, 1], [1, 2], [2, 3], [3, 4]], queries: [[0, 4], [4, 0], [1, 3]] }).result, [true, false, true])
})

test('matches an independent DFS on seeded random graphs', () => {
  const next = rng(1462)
  for (let t = 0; t < 200; t++) {
    const n = 2 + Math.floor(next() * 7)
    const pairs = []
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b) pairs.push([a, b])
    const prerequisites = pairs.filter(() => next() < 0.25).slice(0, 12)
    const queries = []
    for (let q = 1 + Math.floor(next() * 6); q > 0; q--) { const u = Math.floor(next() * n); let v = Math.floor(next() * n); if (v === u) v = (v + 1) % n; queries.push([u, v]) }
    const input = { n, prerequisites, queries }
    const run = buildTrace(parseInput(JSON.stringify(input)))
    assert.deepEqual(run.result, oracle(input), JSON.stringify(input))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"n":3,"prerequisites":[[1,1]],"queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"n":3,"prerequisites":[[0,1],[0,1]],"queries":[[0,2]]}'))
  assert.throws(() => parseInput('{"n":3,"prerequisites":[],"queries":[[0,3]]}'))
  assert.throws(() => parseInput('[]'))
})
