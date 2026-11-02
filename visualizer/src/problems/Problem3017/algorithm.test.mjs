import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, x, y) => buildTrace({ n, x, y }).result

test('3017 worked examples', () => {
  assert.deepEqual(solve(3, 1, 3), [6, 0, 0])
  assert.deepEqual(solve(5, 2, 4), [10, 8, 2, 0, 0])
  assert.deepEqual(solve(4, 1, 1), [6, 4, 2, 0])
})

test('3017 rejects bad input', () => {
  assert.throws(() => parseInput('{"n":1,"x":1,"y":1}'))
  assert.throws(() => parseInput('{"n":4,"x":5,"y":1}'))
})

// Independent oracle: breadth-first search on the line plus the extra cable.
function oracle(n, x, y) {
  const adj = Array.from({ length: n + 1 }, () => [])
  const link = (a, b) => { adj[a].push(b); adj[b].push(a) }
  for (let i = 1; i < n; i++) link(i, i + 1)
  link(x, y)
  const ans = Array(n).fill(0)
  for (let s = 1; s <= n; s++) {
    const dist = Array(n + 1).fill(-1)
    dist[s] = 0
    const queue = [s]
    for (let q = 0; q < queue.length; q++) {
      const u = queue[q]
      for (const v of adj[u]) if (dist[v] < 0) { dist[v] = dist[u] + 1; queue.push(v) }
    }
    for (let t = 1; t <= n; t++) if (t !== s) ans[dist[t] - 1]++
  }
  return ans
}

test('3017 small inputs match a breadth-first oracle', () => {
  for (let n = 2; n <= 9; n++) for (let x = 1; x <= n; x++) for (let y = 1; y <= n; y++) {
    if (x === y) continue
    assert.deepEqual(solve(n, x, y), oracle(n, x, y), JSON.stringify({ n, x, y }))
  }
})
