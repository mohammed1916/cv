import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, k, edges) => buildTrace({ n, k, edges }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: try every integer threshold from 0 to the largest cost, with a plain BFS each time.
function oracle(n, k, edges) {
  const maxCost = Math.max(...edges.map(e => e[2]))
  for (let t = 0; t <= maxCost; t++) {
    const adj = Array.from({ length: n }, () => [])
    for (const [u, v, c] of edges) if (c <= t) { adj[u].push(v); adj[v].push(u) }
    const dist = Array(n).fill(-1)
    dist[0] = 0
    const q = [0]
    for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (dist[v] < 0) { dist[v] = dist[q[h]] + 1; q.push(v) }
    if (dist[n - 1] >= 0 && dist[n - 1] <= k) return t
  }
  return -1
}

test('3807 worked cases', () => {
  const edges = [[0, 1, 2], [1, 2, 5], [0, 2, 9]]
  assert.equal(solve(3, 1, edges), 9)
  assert.equal(solve(3, 2, edges), 5)
  assert.equal(solve(3, 2, [[0, 1, 1]]), -1)
})

test('3807 threshold zero works when the path costs nothing', () => {
  assert.equal(solve(2, 1, [[0, 1, 0]]), 0)
})

test('3807 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ n: 4, k: 2, edges: [[0, 1, 3], [1, 3, 5], [0, 2, 1], [2, 3, 2]] }))
})

test('3807 parseInput rejects bad triples', () => {
  assert.throws(() => parseInput('{"n":3,"k":1,"edges":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"k":1,"edges":[[0,0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"k":1,"edges":[[0,1,-1]]}'))
})

test('3807 binary search matches the linear threshold oracle', () => {
  let seed = 3807
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const k = rnd(4)
    const edges = []
    const has = new Set()
    for (let extra = 1 + rnd(7); extra > 0; extra--) {
      const u = rnd(n), v = rnd(n)
      const key = u < v ? `${u},${v}` : `${v},${u}`
      if (u === v || has.has(key)) continue
      has.add(key)
      edges.push([u, v, rnd(10)])
    }
    if (!edges.length) continue
    assert.equal(solve(n, k, edges), oracle(n, k, edges), JSON.stringify({ n, k, edges }))
  }
})
