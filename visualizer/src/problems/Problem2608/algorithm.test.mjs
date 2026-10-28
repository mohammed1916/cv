import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('2608 official examples', () => {
  assert.equal(solve(7, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 6], [6, 3]]), 3)
  assert.equal(solve(4, [[0, 1], [0, 2]]), -1)
})

test('2608 a tree has no cycle', () => {
  assert.equal(solve(5, [[0, 1], [1, 2], [1, 3], [3, 4]]), -1)
})

test('2608 rejects a repeated edge', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,0]]}'))
})

// Independent oracle: delete each edge in turn; the shortest path between its ends plus one is a cycle through it.
function oracle(n, edges) {
  let best = Infinity
  edges.forEach(([a, b], skip) => {
    const adj = Array.from({ length: n }, () => [])
    edges.forEach(([u, v], i) => {
      if (i === skip) return
      adj[u].push(v)
      adj[v].push(u)
    })
    const dist = Array(n).fill(Infinity)
    dist[a] = 0
    const queue = [a]
    for (let h = 0; h < queue.length; h++) {
      for (const w of adj[queue[h]]) {
        if (dist[w] === Infinity) {
          dist[w] = dist[queue[h]] + 1
          queue.push(w)
        }
      }
    }
    if (dist[b] !== Infinity) best = Math.min(best, dist[b] + 1)
  })
  return best === Infinity ? -1 : best
}

test('2608 random graphs match an edge-deletion oracle', () => {
  let seed = 2608
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const seen = new Set()
    const edges = []
    const want = rnd(Math.min(12, (n * (n - 1)) / 2 + 1))
    while (edges.length < want) {
      const u = rnd(n)
      const v = rnd(n)
      const k = u < v ? `${u}-${v}` : `${v}-${u}`
      if (u === v || seen.has(k)) continue
      seen.add(k)
      edges.push([u, v])
    }
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
