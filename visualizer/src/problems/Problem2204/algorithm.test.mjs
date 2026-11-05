import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('2204 worked examples', () => {
  assert.deepEqual(solve(3, [[0, 1], [1, 2], [2, 0]]), [0, 0, 0])
  assert.deepEqual(solve(5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4]]), [0, 0, 0, 1, 2])
  assert.deepEqual(solve(4, [[0, 1], [1, 2], [2, 3], [3, 1]]), [1, 0, 0, 0])
})

test('2204 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,2]]}'))
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[1,2],[2,0],[0,0]]}'))
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[1,2],[2,0],[0,1]]}'))
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1],[1,2],[1,0],[2,3]]}'))
})

// Oracle: Floyd-Warshall on the full graph, then the minimum distance from each node to any cycle node.
// A cycle node is one whose edge removal keeps it on a cycle: found by checking for an alternative path.
function oracle(n, edges) {
  const onCycle = Array(n).fill(false)
  for (const [u, v] of edges) {
    // Remove edge (u, v); if they are still connected, the edge lies on the cycle.
    const others = edges.filter(([a, b]) => !((a === u && b === v) || (a === v && b === u)))
    const seen = new Set([u]); const q = [u]
    while (q.length) { const x = q.shift(); for (const [a, b] of others) { const y = a === x ? b : b === x ? a : -1; if (y >= 0 && !seen.has(y)) { seen.add(y); q.push(y) } } }
    if (seen.has(v)) { onCycle[u] = true; onCycle[v] = true }
  }
  const dist = []
  for (let s = 0; s < n; s++) {
    const d = Array(n).fill(-1); d[s] = 0; const q = [s]
    while (q.length) { const x = q.shift(); for (const [a, b] of edges) { const y = a === x ? b : b === x ? a : -1; if (y >= 0 && d[y] === -1) { d[y] = d[x] + 1; q.push(y) } } }
    dist.push(d)
  }
  return Array.from({ length: n }, (_, i) => Math.min(...onCycle.map((c, j) => (c ? dist[i][j] : Infinity))))
}

test('2204 random unicyclic graphs match a cycle-membership oracle', () => {
  let seed = 2204
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const cycleLen = 3 + rnd(3)
    const n = cycleLen + rnd(5)
    const edges = []
    for (let i = 0; i < cycleLen; i++) edges.push([i, (i + 1) % cycleLen])
    for (let v = cycleLen; v < n; v++) edges.push([v, rnd(v)])
    assert.deepEqual(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})

test('2204 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"n":3,"edges":[[0,1],[1,2],[2,0]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
