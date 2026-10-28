import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, t, target) => buildTrace({ n, edges, t, target }).result
const EDGES = [[1, 2], [1, 3], [1, 7], [2, 4], [2, 6], [3, 5]]

test('1377 official examples', () => {
  assert.ok(Math.abs(solve(7, EDGES, 2, 4) - 1 / 6) < 1e-9)
  assert.ok(Math.abs(solve(7, EDGES, 1, 7) - 1 / 3) < 1e-9)
})

test('1377 edge cases: a single vertex stays put, and a leaf keeps its probability', () => {
  assert.equal(solve(1, [], 3, 1), 1)
  assert.equal(solve(2, [[1, 2]], 1, 2), 1)
})

test('1377 rejects a disconnected graph and a target out of range', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2],[1,2]],"t":1,"target":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[1,2]],"t":1,"target":3}'))
})

// Independent oracle: enumerate every path the frog can take, using the set of visited vertices,
// and add the probability of each path that is at the target at time t.
function oracle(n, edges, t, target) {
  const adj = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  let total = 0
  const go = (v, visited, time, p) => {
    if (time === t) {
      if (v === target) total += p
      return
    }
    const options = adj[v].filter(u => !visited.has(u))
    if (options.length === 0) {
      if (v === target) total += p
      return
    }
    for (const u of options) {
      const next = new Set(visited)
      next.add(u)
      go(u, next, time + 1, p / options.length)
    }
  }
  go(1, new Set([1]), 0, 1)
  return total
}

test('1377 random trees match an exhaustive path enumeration', () => {
  let seed = 1377
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let tc = 0; tc < 150; tc++) {
    const n = 1 + rnd(8)
    const edges = []
    for (let v = 2; v <= n; v++) edges.push([1 + rnd(v - 1), v])
    const t = 1 + rnd(5)
    const target = 1 + rnd(n)
    assert.ok(Math.abs(solve(n, edges, t, target) - oracle(n, edges, t, target)) < 1e-9, JSON.stringify({ n, edges, t, target }))
  }
})
