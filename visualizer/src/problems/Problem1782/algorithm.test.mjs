import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, queries) => buildTrace(parseInput(JSON.stringify({ n, edges, queries }))).result

test('1782 official example', () => {
  assert.deepEqual(solve(4, [[1, 2], [2, 4], [1, 3], [2, 3], [2, 1]], [2, 3]), [6, 5])
})

test('1782 a parallel edge lowers the incident count', () => {
  // Two nodes joined by two edges: incident edges = 2 + 2 - 2 = 2, so only query 1 is passed.
  assert.deepEqual(solve(2, [[1, 2], [1, 2]], [1, 2]), [1, 0])
})

test('1782 rejects a self loop', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1]],"queries":[0]}'))
})

// Independent oracle: for every pair of nodes, count incident edges directly by scanning the edge list.
function oracle(n, edges, queries) {
  return queries.map(q => {
    let count = 0
    for (let a = 1; a <= n; a++) {
      for (let b = a + 1; b <= n; b++) {
        let incident = 0
        for (const [u, v] of edges) {
          if (u === a || v === a) incident++
          if (u === b || v === b) incident++
          if ((u === a && v === b) || (u === b && v === a)) incident--
        }
        if (incident > q) count++
      }
    }
    return count
  })
}

test('1782 random graphs match a pair-by-pair oracle', () => {
  let seed = 1782
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(6)
    const edges = []
    const m = 1 + rnd(10)
    while (edges.length < m) {
      const u = 1 + rnd(n)
      const v = 1 + rnd(n)
      if (u !== v) edges.push([u, v])
    }
    const queries = Array.from({ length: 1 + rnd(4) }, () => rnd(10))
    assert.deepEqual(solve(n, edges, queries), oracle(n, edges, queries), JSON.stringify({ n, edges, queries }))
  }
})
