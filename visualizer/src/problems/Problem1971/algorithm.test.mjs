import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (n, edges, source, destination) => buildTrace(parseInput(JSON.stringify({ n, edges, source, destination }))).result
// Union-find connectivity as an independent reference.
const connected = (n, edges, a, b) => {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [u, v] of edges) parent[find(u)] = find(v)
  return find(a) === find(b)
}

test('1971 invented graphs', () => {
  assert.equal(solve(3, [[0, 1], [1, 2], [2, 0]], 0, 2), true)
  assert.equal(solve(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5), false)
  assert.equal(solve(3, [], 1, 1), true)
})

test('1971 matches union-find connectivity', () => {
  const edges = [[0, 1], [2, 3], [3, 4], [5, 6], [6, 7], [7, 5], [8, 9]]
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) assert.equal(solve(10, edges, a, b), connected(10, edges, a, b), `${a}->${b}`)
})
