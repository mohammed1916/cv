import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges, source, destination) => buildTrace({ n, edges, source, destination }).result
const pyLines = python.split('\n').length

test('1059 worked examples', () => {
  assert.equal(solve(3, [[0, 1], [0, 2]], 0, 1), false)
  assert.equal(solve(3, [[0, 1], [1, 2]], 0, 2), true)
  assert.equal(solve(4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3), true)
})

test('1059 cycles, self loops and dead destinations are rejected', () => {
  assert.equal(solve(3, [[0, 1], [1, 1]], 0, 1), false)
  assert.equal(solve(3, [[0, 1], [1, 0], [1, 2]], 0, 2), false)
  assert.equal(solve(2, [[0, 1], [1, 0]], 0, 1), false)
  assert.equal(solve(2, [[0, 1], [1, 0]], 0, 0), false)
})

test('1059 edge cases', () => {
  assert.equal(solve(1, [], 0, 0), true)
  assert.equal(solve(2, [], 0, 1), false)
  assert.equal(solve(2, [[0, 1], [1, 0]], 0, 0), false)
  assert.equal(solve(3, [[0, 1]], 0, 1), true)
  assert.equal(solve(3, [[0, 1], [0, 1]], 0, 1), true)
})

test('1059 frames carry valid pseudocode and python lines', () => {
  const run = buildTrace({ n: 4, edges: [[0, 1], [0, 2], [1, 3], [2, 3]], source: 0, destination: 3 })
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
  }
})

test('1059 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2]],"source":0,"destination":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[],"source":0,"destination":5}'))
})

// Oracle: transitive closure. Reachable nodes must not lie on a cycle, must not dead-end
// unless they are the destination, and the destination must have no outgoing edges.
function oracle(n, edges, source, destination) {
  const reach = Array.from({ length: n }, () => Array(n).fill(false))
  for (const [u, v] of edges) reach[u][v] = true
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true
  const outdeg = Array(n).fill(0)
  for (const [u] of edges) outdeg[u]++
  const seen = new Set([source])
  for (let j = 0; j < n; j++) if (reach[source][j]) seen.add(j)
  for (const u of seen) {
    if (reach[u][u]) return false
    if (outdeg[u] === 0 && u !== destination) return false
    if (u === destination && outdeg[u] > 0) return false
  }
  return true
}

test('1059 random graphs match a transitive-closure oracle', () => {
  let seed = 1059
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 500; t++) {
    const n = 1 + rnd(6)
    const edges = Array.from({ length: rnd(9) }, () => [rnd(n), rnd(n)])
    const source = rnd(n)
    const destination = rnd(n)
    assert.equal(solve(n, edges, source, destination), oracle(n, edges, source, destination), JSON.stringify({ n, edges, source, destination }))
  }
})
