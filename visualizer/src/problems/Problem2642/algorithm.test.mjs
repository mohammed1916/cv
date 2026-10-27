import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, operations) => buildTrace(parseInput(JSON.stringify({ n, edges, operations }))).result

test('2642 examples: the answer changes after an edge is added', () => {
  const edges = [[0, 2, 5], [0, 1, 2], [1, 2, 1], [3, 0, 3]]
  assert.deepEqual(solve(4, edges, [['shortestPath', 3, 2], ['shortestPath', 0, 3], ['addEdge', [1, 3, 4]], ['shortestPath', 0, 3]]), [6, -1, 6])
})

test('2642 an added edge can make a route shorter', () => {
  assert.deepEqual(solve(3, [[0, 1, 9]], [['shortestPath', 0, 1], ['addEdge', [0, 1, 4]], ['shortestPath', 0, 1]]), [9, 4])
})

test('2642 edges are directed', () => {
  assert.deepEqual(solve(2, [[0, 1, 3]], [['shortestPath', 1, 0]]), [-1])
})

test('2642 rejects an unknown operation and an out-of-range node', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[],"operations":[["removeEdge",[0,1,2]]]}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2,1]],"operations":[["shortestPath",0,1]]}'))
})

// Independent oracle: after every query, run Floyd-Warshall over the edges added so far.
function oracle(n, edges, operations) {
  const list = edges.map(e => [...e])
  const answers = []
  for (const op of operations) {
    if (op[0] === 'addEdge') { list.push([...op[1]]); continue }
    const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
    for (const [u, v, w] of list) d[u][v] = Math.min(d[u][v], w)
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
    const best = d[op[1]][op[2]]
    answers.push(best === Infinity ? -1 : best)
  }
  return answers
}

test('2642 random sequences match a Floyd-Warshall oracle', () => {
  let seed = 2642
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const edges = Array.from({ length: rnd(6) }, () => { const u = rnd(n); let v = rnd(n); if (v === u) v = (u + 1) % n; return [u, v, 1 + rnd(10)] })
    const operations = Array.from({ length: 1 + rnd(8) }, () => (rnd(2) === 0
      ? ['addEdge', (() => { const u = rnd(n); let v = rnd(n); if (v === u) v = (u + 1) % n; return [u, v, 1 + rnd(10)] })()]
      : ['shortestPath', rnd(n), rnd(n)]))
    assert.deepEqual(solve(n, edges, operations), oracle(n, edges, operations), JSON.stringify({ n, edges, operations }))
  }
})
