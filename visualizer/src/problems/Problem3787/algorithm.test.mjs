import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

function allPairs(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  return Array.from({ length: n }, (_, s) => {
    const dist = Array(n).fill(-1)
    dist[s] = 0
    const q = [s]
    for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (dist[v] < 0) { dist[v] = dist[q[h]] + 1; q.push(v) }
    return dist
  })
}

test('3787 worked case returns a diameter pair in ascending order', () => {
  const edges = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5]]
  assert.deepEqual(solve(6, edges), [0, 5])
})

test('3787 a single edge is its own diameter', () => {
  assert.deepEqual(solve(2, [[1, 0]]), [0, 1])
})

test('3787 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ n: 6, edges: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5]] }))
})

test('3787 parseInput rejects non-trees', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,2],[2,0]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1]]}'))
})

test('3787 random trees return endpoints at the true diameter', () => {
  let seed = 3787
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(10)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([i, rnd(i)])
    const d = allPairs(n, edges)
    const diameter = Math.max(...d.flat())
    const [a, b] = solve(n, edges)
    assert.ok(a < b, 'sorted ascending')
    assert.equal(d[a][b], diameter, JSON.stringify({ n, edges }))
  }
})
