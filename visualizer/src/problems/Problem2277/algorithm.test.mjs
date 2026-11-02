import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace(parseInput(JSON.stringify({ n, edges, queries }))).result
const TREE = [[0, 1], [1, 2], [2, 3], [1, 4]]

test('2277 worked examples', () => {
  assert.deepEqual(solve(5, TREE, [[0, 3, 4]]), [1])
  assert.deepEqual(solve(5, TREE, [[0, 3, 2]]), [2])
  assert.deepEqual(solve(5, TREE, [[3, 4, 0]]), [1])
  assert.deepEqual(solve(5, TREE, [[0, 3, 4], [3, 4, 0], [2, 2, 4]]), [1, 1, 2])
})

test('2277 rejects invalid trees and queries', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1]],"queries":[[0,1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]],"queries":[[0,1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,2]],"queries":[[0,5,2]]}'))
})

// Oracle: Floyd-Warshall distances. The path is the set of vertices v with d(s,v)+d(v,e)=d(s,e).
function oracle(n, edges, queries) {
  const INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  for (const [a, b] of edges) { d[a][b] = 1; d[b][a] = 1 }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  return queries.map(([s, e, x]) => {
    const onPath = [...Array(n).keys()].filter(v => d[s][v] + d[v][e] === d[s][e])
    return onPath.reduce((best, v) => (d[x][v] < d[x][best] ? v : best), onPath[0])
  })
}

test('2277 random trees match a Floyd-Warshall oracle', () => {
  let seed = 2277
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 2 + rnd(8)
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v])
    const queries = Array.from({ length: 1 + rnd(3) }, () => [rnd(n), rnd(n), rnd(n)])
    assert.deepEqual(solve(n, edges, queries), oracle(n, edges, queries), JSON.stringify({ n, edges, queries }))
  }
})

test('2277 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"n":5,"edges":[[0,1],[1,2],[2,3],[1,4]],"queries":[[0,3,4]]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
