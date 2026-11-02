import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, queries) => buildTrace({ n, queries }).result

test('2445 worked examples', () => {
  assert.equal(solve(5, [1, 2]), 2)
  assert.equal(solve(7, [2, 2, 3]), 3)
  assert.equal(solve(1, []), 0)
  assert.equal(solve(1, [1]), 1)
})

test('2445 rejects a query outside the tree', () => {
  assert.throws(() => parseInput('{"n":3,"queries":[4]}'))
  assert.throws(() => parseInput('{"n":40,"queries":[1]}'))
})

// Oracle: literally toggle every node of the queried subtree, testing membership by walking up to the root.
function oracle(n, queries) {
  const value = Array(n + 1).fill(0)
  const inSubtree = (node, root) => {
    for (let u = node; u >= 1; u = Math.floor(u / 2)) if (u === root) return true
    return false
  }
  for (const x of queries) for (let v = 1; v <= n; v++) if (inSubtree(v, x)) value[v] ^= 1
  return value.slice(1).reduce((a, b) => a + b, 0)
}

test('2445 random trees match a literal subtree-toggle oracle', () => {
  let seed = 2445
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(31)
    const queries = Array.from({ length: rnd(8) }, () => 1 + rnd(n))
    assert.equal(solve(n, queries), oracle(n, queries), JSON.stringify({ n, queries }))
  }
})
