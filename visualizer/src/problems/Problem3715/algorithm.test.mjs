import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, squareFreePart } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

// Oracle: for each non-root node, count ancestors whose product with it is a perfect square.
function oracle({ n, edges, nums }) {
  const parent = Array(n).fill(-1)
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  const order = [0]; const seen = new Set([0])
  for (let i = 0; i < order.length; i++) for (const w of adj[order[i]]) if (!seen.has(w)) { seen.add(w); parent[w] = order[i]; order.push(w) }
  const isSquare = x => { const r = Math.round(Math.sqrt(x)); return r * r === x }
  let total = 0
  for (let v = 1; v < n; v++) {
    for (let a = parent[v]; a !== -1; a = parent[a]) if (isSquare(nums[v] * nums[a])) total++
  }
  return total
}

test('3715 invented examples', () => {
  assert.equal(solve({ n: 4, edges: [[0, 3], [3, 1], [0, 2]], nums: [2, 8, 2, 18] }), 4)
  assert.equal(solve({ n: 3, edges: [[0, 2], [2, 1]], nums: [8, 2, 18] }), oracle({ n: 3, edges: [[0, 2], [2, 1]], nums: [8, 2, 18] }))
})

test('3715 square-free part and oracle agreement on a deeper tree', () => {
  assert.equal(squareFreePart(12), 3)
  assert.equal(squareFreePart(8), 2)
  const input = { n: 6, edges: [[0, 1], [1, 2], [1, 3], [3, 4], [0, 5]], nums: [2, 8, 2, 18, 9, 32] }
  assert.equal(solve(input), oracle(input))
})

test('3715 rejects a disconnected edge list', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[1,2]],"nums":[1,1,1]}'))
})
