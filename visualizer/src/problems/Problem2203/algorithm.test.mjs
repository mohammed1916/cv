import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = spec => buildTrace(parseInput(JSON.stringify(spec))).result

test('2203 worked examples', () => {
  assert.equal(solve({ n: 4, edges: [[0, 1, 2], [1, 2, 1], [0, 2, 4], [2, 3, 1], [1, 3, 5]], src1: 0, src2: 1, dest: 3 }), 4)
  assert.equal(solve({ n: 3, edges: [[0, 1, 1], [1, 2, 1]], src1: 0, src2: 2, dest: 1 }), -1)
  assert.equal(solve({ n: 3, edges: [[0, 2, 3], [1, 2, 2]], src1: 0, src2: 1, dest: 2 }), 5)
})

test('2203 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[],"src1":0,"src2":1,"dest":1}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,0,1]],"src1":0,"src2":1,"dest":2}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,0]],"src1":0,"src2":1,"dest":2}'))
  assert.throws(() => parseInput('{"n":3,"edges":[],"src1":0,"src2":1,"dest":5}'))
})

// Oracle: enumerate every subset of edges (small graphs) and keep the cheapest one that contains both paths.
function oracle({ n, edges, src1, src2, dest }) {
  const m = edges.length
  let best = Infinity
  for (let mask = 0; mask < (1 << m); mask++) {
    const sub = edges.filter((_, i) => (mask >> i) & 1)
    const w = sub.reduce((s, e) => s + e[2], 0)
    if (w >= best) continue
    const reach = s => {
      const seen = new Set([s]); const q = [s]
      while (q.length) { const u = q.shift(); for (const [a, b] of sub) if (a === u && !seen.has(b)) { seen.add(b); q.push(b) } }
      return seen
    }
    if (reach(src1).has(dest) && reach(src2).has(dest)) best = w
  }
  return best === Infinity ? -1 : best
}

test('2203 small graphs match an edge-subset oracle', () => {
  let seed = 2203
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 60; t++) {
    const n = 3 + rnd(3)
    const edges = []
    for (let i = 0; i < 6; i++) {
      const u = rnd(n); const v = rnd(n)
      if (u !== v) edges.push([u, v, 1 + rnd(5)])
    }
    const spec = { n, edges, src1: 0, src2: 1, dest: 2 }
    assert.equal(solve(spec), oracle(spec), JSON.stringify(spec))
  }
})

test('2203 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"n":3,"edges":[[0,2,3],[1,2,2]],"src1":0,"src2":1,"dest":2}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
