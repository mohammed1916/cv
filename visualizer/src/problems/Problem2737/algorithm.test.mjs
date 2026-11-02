import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python, code } from './algorithm.js'

const solve = (n, edges, s, marked) => buildTrace({ n, edges, s, marked }).answer

test('2737 worked examples', () => {
  // Distances from 0: 1 is 2, 2 is min(9, 2 + 3) = 5, 3 is 6. Marked {2, 3} gives 5.
  assert.equal(solve(4, [[0, 1, 2], [1, 2, 3], [0, 2, 9], [2, 3, 1]], 0, [2, 3]), 5)
  // The start is marked, so the cost is zero.
  assert.equal(solve(3, [[0, 1, 4]], 1, [1]), 0)
  // Vertex 2 cannot be reached from 0.
  assert.equal(solve(3, [[0, 1, 4]], 0, [2]), -1)
})

test('2737 edge cases', () => {
  assert.equal(solve(1, [], 0, [0]), 0)
  assert.equal(solve(1, [], 0, []), -1)
  // Edges are directed: 1 to 0 does not help from 0.
  assert.equal(solve(2, [[1, 0, 1]], 0, [1]), -1)
  // A zero-weight edge still counts as reaching the marked vertex.
  assert.equal(solve(2, [[0, 1, 0]], 0, [1]), 0)
})

test('2737 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,-1]],"s":0,"marked":[1]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,5,1]],"s":0,"marked":[1]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[],"s":2,"marked":[1]}'))
})

test('2737 visualization cap is enforced', () => {
  const edges = Array.from({ length: 31 }, (_, i) => [0, 1, i % 3])
  assert.throws(() => buildTrace({ n: 2, edges, s: 0, marked: [1] }))
})

// Independent oracle: Floyd-Warshall all-pairs distances, then the minimum over marked vertices.
function oracle(n, edges, s, marked) {
  const INF = Infinity
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w)
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  let best = INF
  for (const m of marked) best = Math.min(best, d[s][m])
  return best === INF ? -1 : best
}

test('2737 random graphs match a Floyd-Warshall oracle', () => {
  let seed = 2737
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const edges = Array.from({ length: rnd(14) }, () => [rnd(n), rnd(n), rnd(10)])
    const s = rnd(n)
    const marked = Array.from({ length: rnd(n + 1) }, () => rnd(n))
    assert.equal(solve(n, edges, s, marked), oracle(n, edges, s, marked), JSON.stringify({ n, edges, s, marked }))
  }
})

test('2737 frame invariants: activeLine and pythonLine are real lines', () => {
  const codeLines = new Set(code.map(c => c.line))
  const pyLines = python.split('\n').length
  const run = buildTrace({ n: 4, edges: [[0, 1, 2], [1, 2, 3], [0, 2, 9], [2, 3, 1]], s: 0, marked: [2, 3] })
  assert.ok(run.frames.length > 0)
  for (const frame of run.frames) {
    assert.ok(codeLines.has(frame.activeLine), `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(typeof frame.message, 'string')
    assert.ok(Array.isArray(frame.dist) && Array.isArray(frame.settled))
  }
})

test('2737 python export runs on the first example', () => {
  const out = execFileSync('python3', ['-I', '-c', python], {
    input: '{"n":4,"edges":[[0,1,2],[1,2,3],[0,2,9],[2,3,1]],"s":0,"marked":[2,3]}',
  }).toString().trim()
  assert.equal(out, '5')
})
