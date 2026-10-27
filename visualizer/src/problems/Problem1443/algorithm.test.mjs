import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1443 official examples', () => {
  const edges = [[0, 1], [0, 2], [1, 4], [1, 5], [2, 3], [2, 6]]
  assert.equal(solve({ n: 7, edges, has_apple: [false, false, true, false, true, true, false] }), 8)
  assert.equal(solve({ n: 7, edges, has_apple: [false, false, true, false, false, true, false] }), 6)
  assert.equal(solve({ n: 5, edges: [[0, 1], [1, 2], [0, 3], [3, 4]], has_apple: [false, false, false, false, false] }), 0)
})

test('1443 a single apple costs its round trip and a root apple is free', () => {
  assert.equal(solve({ n: 1, edges: [], has_apple: [true] }), 0)
  assert.equal(solve({ n: 3, edges: [[0, 1], [1, 2]], has_apple: [false, false, true] }), 4)
})

test('1443 rejects a graph with a cycle', () => {
  assert.throws(() => parseInput(JSON.stringify({ n: 3, edges: [[0, 1], [0, 1]], has_apple: [false, false, false] })))
})

// Independent oracle: for each apple, take the BFS parent path back to vertex 0; every edge
// on any such path is walked twice, so the answer is twice the number of distinct path edges.
function oracle({ n, edges, has_apple: apples }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const up = Array(n).fill(-1)
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  for (let q = 0; q < queue.length; q++) {
    for (const w of adj[queue[q]]) if (!seen[w]) { seen[w] = true; up[w] = queue[q]; queue.push(w) }
  }
  const used = new Set()
  apples.forEach((has, v) => {
    if (!has) return
    for (let x = v; x !== 0; x = up[x]) used.add(`${Math.min(x, up[x])}-${Math.max(x, up[x])}`)
  })
  return 2 * used.size
}

test('1443 random trees match a path-union oracle', () => {
  let seed = 1443
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    const has_apple = Array.from({ length: n }, () => rnd(3) === 0)
    const input = { n, edges, has_apple }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
