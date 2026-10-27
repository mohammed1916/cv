import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1483 statement example', () => {
  assert.deepEqual(solve({ parent: [-1, 0, 0, 1, 1, 2, 2], queries: [[3, 1], [5, 2], [6, 3]] }), [1, 0, -1])
})

test('1483 rejects a cycle', () => {
  assert.throws(() => parseInput('{"parent":[-1,2,1],"queries":[[1,1]]}'))
})

// Independent oracle: walk up one parent at a time for every query.
function oracle({ parent, queries }) {
  return queries.map(([node, k]) => {
    let v = node
    for (let s = 0; s < k && v !== -1; s++) v = parent[v]
    return v
  })
}

test('1483 random trees match a step-by-step oracle', () => {
  let seed = 1483
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const parent = [-1]
    for (let i = 1; i < n; i++) parent.push(rnd(i))
    const queries = Array.from({ length: 1 + rnd(8) }, () => [rnd(n), 1 + rnd(n)])
    const input = { parent, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
