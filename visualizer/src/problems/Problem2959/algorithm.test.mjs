import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, maxDistance, roads) => buildTrace({ n, maxDistance, roads }).result

test('2959 worked examples', () => {
  assert.equal(solve(3, 5, [[0, 1, 2], [1, 2, 10], [0, 2, 10]]), 5)
  assert.equal(solve(3, 5, [[0, 1, 2], [1, 2, 10]]), 5)
})

test('2959 edge cases', () => {
  assert.equal(solve(1, 0, []), 2)
  assert.equal(solve(2, 3, [[0, 1, 3]]), 4)
  assert.equal(solve(2, 2, [[0, 1, 3]]), 3)
  assert.throws(() => parseInput('{"n":2,"maxDistance":1,"roads":[[0,0,1]]}'))
})

// Independent oracle: Bellman-Ford from each branch, then test each subset by recursion.
function oracle(n, maxDistance, roads) {
  const INF = Infinity
  const d = Array.from({ length: n }, (_, s) => {
    const dd = Array(n).fill(INF)
    dd[s] = 0
    for (let it = 0; it < n; it++) {
      for (const [u, v, w] of roads) {
        if (dd[u] + w < dd[v]) dd[v] = dd[u] + w
        if (dd[v] + w < dd[u]) dd[u] = dd[v] + w
      }
    }
    return dd
  })
  const valid = set => set.every(a => set.every(b => d[a][b] <= maxDistance))
  let count = 0
  const choose = (i, chosen) => {
    if (i === n) { if (valid(chosen)) count++; return }
    choose(i + 1, chosen)
    choose(i + 1, [...chosen, i])
  }
  choose(0, [])
  return count
}

test('2959 random small graphs match a Bellman-Ford oracle', () => {
  let seed = 2959
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    const roads = []
    for (let e = rnd(6); e > 0; e--) {
      const u = rnd(n)
      const v = rnd(n)
      if (u !== v) roads.push([u, v, 1 + rnd(9)])
    }
    const maxDistance = rnd(15)
    assert.equal(solve(n, maxDistance, roads), oracle(n, maxDistance, roads), JSON.stringify({ n, maxDistance, roads }))
  }
})
