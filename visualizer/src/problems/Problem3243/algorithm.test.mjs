import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, queries) => buildTrace({ n, queries }).result

test('3243 official example', () => {
  assert.deepEqual(solve(5, [[2, 4], [0, 2], [0, 4]]), [3, 2, 1])
})

test('3243 a road that does not help leaves the distance unchanged', () => {
  assert.deepEqual(solve(4, [[0, 3]]), [1])
  assert.deepEqual(solve(6, [[1, 3]]), [4])
})

test('3243 rejects a road that already exists', () => {
  assert.throws(() => parseInput('{"n":4,"queries":[[1,2]]}'), /cannot repeat/)
})

// Independent oracle: Floyd-Warshall on the directed graph after each prefix of queries.
function oracle(n, queries) {
  const base = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (let i = 0; i + 1 < n; i++) base[i][i + 1] = 1
  const answers = []
  for (const [u, v] of queries) {
    base[u][v] = 1
    const d = base.map(row => [...row])
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
    answers.push(d[0][n - 1])
  }
  return answers
}

test('3243 random roads match a Floyd-Warshall oracle', () => {
  let seed = 3243
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(8)
    const seen = new Set()
    const queries = []
    for (let attempt = 0; attempt < 30 && queries.length < 1 + rnd(6); attempt++) {
      const u = rnd(n - 2)
      const v = u + 2 + rnd(n - u - 2)
      const key = `${u},${v}`
      if (seen.has(key)) continue
      seen.add(key)
      queries.push([u, v])
    }
    if (queries.length === 0) continue
    assert.deepEqual(solve(n, queries), oracle(n, queries), JSON.stringify({ n, queries }))
  }
})
