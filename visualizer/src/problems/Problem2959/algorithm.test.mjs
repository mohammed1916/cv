import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, maxDistance, roads) => buildTrace(parseInput(JSON.stringify({ n, maxDistance, roads }))).result
const PY = python.split('\n')

test('2959 roads used only when both ends stay open', () => {
  // {0, 2} alone is too far (10 > 5), while {0, 1, 2} reaches 0 to 2 through 1 in 4.
  assert.equal(solve(3, 5, [[0, 1, 2], [1, 2, 2], [0, 2, 10]]), 7)
})

test('2959 the empty set and singletons always count', () => {
  assert.equal(solve(1, 1, []), 2)
  assert.equal(solve(2, 1, []), 3)
})

test('2959 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 3, maxDistance: 4, roads: [[0, 1, 2], [1, 2, 3]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2959 rejects loops and bad lengths', () => {
  assert.throws(() => parseInput('{"n":2,"maxDistance":3,"roads":[[1,1,2]]}'))
  assert.throws(() => parseInput('{"n":2,"maxDistance":3,"roads":[[0,1,0]]}'))
})

// Oracle: relax every road in a Bellman-Ford style loop over the open subgraph, then compare pairs directly.
function oracle(n, maxDistance, roads) {
  let count = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const open = [...Array(n).keys()].filter(i => (mask >> i) & 1)
    const d = new Map()
    const key = (a, b) => `${a}-${b}`
    for (const a of open) for (const b of open) d.set(key(a, b), a === b ? 0 : Infinity)
    const edges = roads.filter(([u, v]) => (mask >> u) & 1 && (mask >> v) & 1)
    for (let round = 0; round < n; round++) {
      for (const [u, v, w] of edges) {
        for (const [a, b] of [[u, v], [v, u]]) {
          for (const x of open) {
            const via = d.get(key(x, a)) + w
            if (via < d.get(key(x, b))) d.set(key(x, b), via)
            if (d.get(key(x, b)) < d.get(key(b, x))) d.set(key(b, x), d.get(key(x, b)))
          }
        }
      }
    }
    if (open.every(a => open.every(b => d.get(key(a, b)) <= maxDistance))) count++
  }
  return count
}

test('2959 random small instances match an oracle', () => {
  let seed = 2959
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(5)
    const roads = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rnd(2)) roads.push([a, b, 1 + rnd(9)])
    const maxDistance = 1 + rnd(15)
    assert.equal(solve(n, maxDistance, roads), oracle(n, maxDistance, roads), JSON.stringify({ n, maxDistance, roads }))
  }
})
