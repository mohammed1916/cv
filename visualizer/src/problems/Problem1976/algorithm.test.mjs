import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (n, roads) => buildTrace(parseInput(JSON.stringify({ n, roads }))).result
// Enumerate every simple route from 0 to n-1 and keep the shortest ones.
const brute = (n, roads) => {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of roads) { adj[u].push([v, w]); adj[v].push([u, w]) }
  let best = Infinity, count = 0
  const walk = (node, len, seen) => {
    if (node === n - 1) {
      if (len < best) { best = len; count = 1 } else if (len === best) count++
      return
    }
    for (const [v, w] of adj[node]) if (!seen.has(v)) { seen.add(v); walk(v, len + w, seen); seen.delete(v) }
  }
  walk(0, 0, new Set([0]))
  return count
}

test('1976 invented roads', () => {
  assert.equal(solve(4, [[0, 1, 2], [1, 3, 2], [0, 2, 3], [2, 3, 1]]), 2)
  assert.equal(solve(2, [[0, 1, 5]]), 1)
  assert.equal(solve(3, [[0, 1, 1], [1, 2, 1], [0, 2, 2]]), 2)
})

test('1976 matches enumeration of simple routes', () => {
  const cases = [
    [5, [[0, 1, 1], [1, 4, 1], [0, 2, 1], [2, 3, 1], [3, 4, 1]]],
    [4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 2, 2], [1, 3, 3]]],
    [6, [[0, 1, 2], [0, 2, 2], [1, 3, 1], [2, 3, 1], [3, 4, 1], [3, 5, 2], [4, 5, 1]]],
  ]
  for (const [n, roads] of cases) assert.equal(solve(n, roads), brute(n, roads), JSON.stringify(roads))
})
