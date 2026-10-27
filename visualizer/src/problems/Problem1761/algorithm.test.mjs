import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('1761 official examples', () => {
  assert.equal(solve(6, [[1, 2], [1, 3], [3, 2], [4, 1], [5, 2], [3, 6]]), 3)
  assert.equal(solve(7, [[1, 3], [4, 1], [4, 3], [2, 5], [5, 6], [6, 7], [7, 5], [2, 6]]), 0)
})

test('1761 edge cases', () => {
  assert.equal(solve(3, [[1, 2], [2, 3]]), -1)
  assert.equal(solve(3, [[1, 2], [2, 3], [1, 3]]), 0)
})

test('1761 rejects self loops and duplicate edges', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[2,1]]}'))
})

// Independent oracle: examine every three-node set, read adjacency from the edge list, and count edges that leave it.
function oracle(n, edges) {
  const joined = (p, q) => edges.some(([x, y]) => (x === p && y === q) || (x === q && y === p))
  const degreeOf = v => edges.filter(e => e.includes(v)).length
  let best = -1
  for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) for (let c = b + 1; c <= n; c++) {
    if (!(joined(a, b) && joined(b, c) && joined(a, c))) continue
    const outside = [a, b, c].reduce((sum, v) => sum + degreeOf(v), 0) - 6
    if (best === -1 || outside < best) best = outside
  }
  return best
}

test('1761 random graphs match an edge-list oracle', () => {
  let seed = 1761
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(8)
    const edges = []
    const seen = new Set()
    const count = rnd(20)
    for (let i = 0; i < count; i++) {
      const a = 1 + rnd(n)
      const b = 1 + rnd(n)
      const key = Math.min(a, b) + ',' + Math.max(a, b)
      if (a !== b && !seen.has(key)) { seen.add(key); edges.push([a, b]) }
    }
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
