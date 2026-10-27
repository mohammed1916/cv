import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2846 statement example', () => {
  const edges = [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 5, 2], [5, 6, 2]]
  assert.deepEqual(solve({ n: 7, edges, queries: [[0, 3], [3, 6], [2, 6], [0, 6]] }), [0, 0, 1, 3])
})

test('2846 rejects a weight of zero', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,0]],"queries":[[0,1]]}'))
})

// Independent oracle: find the path with a breadth-first search, then try every single target weight.
function oracle({ n, edges, queries }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]) }
  return queries.map(([a, b]) => {
    const prev = new Map([[a, null]])
    const queue = [a]
    for (let i = 0; i < queue.length; i++) {
      const u = queue[i]
      for (const [w] of adj[u]) if (!prev.has(w)) { prev.set(w, u); queue.push(w) }
    }
    const weightOf = (u, v) => adj[u].find(([w]) => w === v)[1]
    const path = []
    for (let v = b; prev.get(v) !== null && v !== a; v = prev.get(v)) path.push(weightOf(v, prev.get(v)))
    if (a === b) return 0
    let best = Infinity
    for (let c = 1; c <= 26; c++) best = Math.min(best, path.filter(w => w !== c).length)
    return best
  })
}

test('2846 random trees match a breadth-first oracle', () => {
  let seed = 2846
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(8)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i, 1 + rnd(3)])
    const queries = Array.from({ length: 1 + rnd(6) }, () => [rnd(n), rnd(n)])
    const input = { n, edges, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
