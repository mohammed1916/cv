import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (par, vals, queries) => buildTrace(parseInput(JSON.stringify({ par, vals, queries }))).result

test('3590 official examples', () => {
  assert.deepEqual(solve([-1, 0, 0], [1, 1, 1], [[0, 1], [0, 2], [0, 3]]), [0, 1, -1])
  assert.deepEqual(solve([-1, 0, 1], [5, 2, 7], [[0, 1], [1, 2], [1, 3], [2, 1]]), [0, 7, -1, 0])
})

test('3590 a single node has one path XOR', () => {
  assert.deepEqual(solve([-1], [9], [[0, 1]]), [9])
})

test('3590 rejects a parent array with a cycle', () => {
  assert.throws(() => parseInput('{"par":[-1,2,1],"vals":[1,2,3],"queries":[[0,1]]}'))
})

// Independent oracle: for each query, test every node for being in the subtree by walking up its ancestor chain.
function oracle(par, vals, queries) {
  const n = vals.length
  const pathXor = i => {
    let x = 0
    for (let v = i; v !== -1; v = par[v]) x ^= vals[v]
    return x
  }
  const inSubtree = (w, u) => {
    for (let v = w; v !== -1; v = par[v]) if (v === u) return true
    return false
  }
  return queries.map(([u, k]) => {
    const values = []
    for (let w = 0; w < n; w++) if (inSubtree(w, u)) values.push(pathXor(w))
    const distinct = [...new Set(values)].sort((a, b) => a - b)
    return k <= distinct.length ? distinct[k - 1] : -1
  })
}

test('3590 random trees match an ancestor-walk oracle', () => {
  let seed = 3590
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 1 + rnd(8)
    const par = [-1]
    for (let i = 1; i < n; i++) par.push(rnd(i))
    const vals = Array.from({ length: n }, () => rnd(16))
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), 1 + rnd(n)])
    assert.deepEqual(solve(par, vals, queries), oracle(par, vals, queries), JSON.stringify({ par, vals, queries }))
  }
})
