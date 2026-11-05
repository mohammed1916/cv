import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('2192 worked examples', () => {
  assert.deepEqual(solve(4, [[0, 1], [0, 2], [1, 3], [2, 3]]), [[], [0], [0], [0, 1, 2]])
  assert.deepEqual(solve(3, [[0, 1], [1, 2]]), [[], [0], [0, 1]])
  assert.deepEqual(solve(2, []), [[], []])
})

test('2192 rejects invalid input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2]]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1],[1,0]]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[1,1]]}'))
})

// Oracle: a plain reachability check from every node in the reversed direction.
function oracle(n, edges) {
  const reach = Array.from({ length: n }, () => Array(n).fill(false))
  for (const [u, v] of edges) reach[u][v] = true
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (reach[i][k] && reach[k][j]) reach[i][j] = true
  return Array.from({ length: n }, (_, j) => Array.from({ length: n }, (_, i) => i).filter(i => reach[i][j]))
}

test('2192 random DAGs match a transitive-closure oracle', () => {
  let seed = 2192
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const perm = Array.from({ length: n }, (_, i) => i).sort(() => rnd(2) - 0.5)
    const edges = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rnd(3) === 0) edges.push([perm[i], perm[j]])
    assert.deepEqual(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})

test('2192 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"n":4,"edges":[[0,1],[0,2],[1,3],[2,3]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
