import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2467 statement examples', () => {
  assert.equal(solve({ edges: [[0, 1], [1, 2], [1, 3], [3, 4]], bob: 3, amount: [-2, 4, 2, -4, 6] }), 6)
  assert.equal(solve({ edges: [[0, 1]], bob: 1, amount: [-7280, 2350] }), -7280)
})

test('2467 rejects a disconnected edge list', () => {
  assert.throws(() => parseInput('{"edges":[[0,1],[2,3]],"bob":0,"amount":[1,2,3,4]}'))
})

// Independent oracle: enumerate every path from node zero to a leaf, and compare with Bob's distances from his start.
function oracle({ edges, bob, amount }) {
  const n = amount.length
  const dist = Array.from({ length: n }, () => Array(n).fill(Infinity))
  for (let i = 0; i < n; i++) dist[i][i] = 0
  for (const [u, v] of edges) { dist[u][v] = 1; dist[v][u] = 1 }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j])
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  let best = null
  const walk = (path) => {
    const u = path[path.length - 1]
    const next = adj[u].filter(w => !path.includes(w))
    if (next.length === 0 && u !== 0) {
      let total = 0
      path.forEach((node, time) => {
        const onBobPath = dist[0][node] + dist[node][bob] === dist[0][bob]
        const bobArrives = onBobPath ? dist[bob][node] : Infinity
        if (time < bobArrives) total += amount[node]
        else if (time === bobArrives) total += amount[node] / 2
      })
      best = best === null ? total : Math.max(best, total)
    }
    for (const w of next) walk([...path, w])
  }
  walk([0])
  return best
}

test('2467 random trees match a path-enumeration oracle', () => {
  let seed = 2467
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(9)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    const bob = rnd(n)
    const amount = Array.from({ length: n }, () => 2 * (rnd(101) - 50))
    const input = { edges, bob, amount }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
