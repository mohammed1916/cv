import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, score) => buildTrace(parseInput(JSON.stringify({ n, edges, score }))).result

test('3530 official examples', () => {
  assert.equal(solve(2, [[0, 1]], [2, 3]), 8)
  assert.equal(solve(3, [[0, 1], [0, 2]], [1, 6, 3]), 25)
})

test('3530 a single node', () => {
  assert.equal(solve(1, [], [7]), 7)
})

test('3530 rejects a cycle', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1],[1,0]],"score":[1,1]}'))
})

// Independent oracle: try every ordering of the nodes, keep the valid topological ones, take the best.
function oracle(n, edges, score) {
  let best = -Infinity
  const perm = []
  const used = Array(n).fill(false)
  const walk = () => {
    if (perm.length === n) {
      const pos = Array(n)
      perm.forEach((v, i) => { pos[v] = i })
      if (edges.every(([u, v]) => pos[u] < pos[v])) {
        best = Math.max(best, perm.reduce((sum, v, i) => sum + score[v] * (i + 1), 0))
      }
      return
    }
    for (let v = 0; v < n; v++) {
      if (used[v]) continue
      used[v] = true; perm.push(v)
      walk()
      perm.pop(); used[v] = false
    }
  }
  walk()
  return best
}

let seed = 3530
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3530 seeded random against permutation oracle', () => {
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(6)
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [order[i], order[j]] = [order[j], order[i]] }
    const edges = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (rnd(3) === 0) edges.push([order[i], order[j]])
    const score = Array.from({ length: n }, () => 1 + rnd(20))
    assert.equal(solve(n, edges, score), oracle(n, edges, score), JSON.stringify({ n, edges, score }))
  }
})
