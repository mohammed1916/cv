import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges, source, destination, k) => buildTrace({ n, edges, source, destination, k }).result

test('2714 worked presets', () => {
  const edges = [[0, 1, 4], [1, 2, 7], [0, 3, 1], [3, 2, 9], [2, 4, 2], [1, 4, 8]]
  assert.equal(solve(5, edges, 0, 4, 1), 3)
  assert.equal(solve(3, [[0, 1, 2]], 2, 0, 2), -1)
  assert.equal(solve(4, [[0, 1, 3], [1, 2, 3], [2, 3, 3]], 0, 3, 2), 3)
})

test('2714 zero free hops is plain Dijkstra and directed edges only', () => {
  const chain = [[0, 1, 3], [1, 2, 3], [2, 3, 3]]
  assert.equal(solve(4, chain, 0, 3, 0), 9)
  assert.equal(solve(4, chain, 3, 0, 3), -1)
  assert.equal(solve(1, [], 0, 0, 0), 0)
})

test('2714 rejects bad endpoints and weights', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,2,1]],"source":0,"destination":1,"k":0}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,10]],"source":0,"destination":1,"k":0}'))
  assert.throws(() => parseInput('{"n":2,"edges":[],"source":0,"destination":1,"k":7}'))
})

test('2714 frames reference real pseudocode and python lines', () => {
  const { frames } = buildTrace({ n: 3, edges: [[0, 1, 2], [1, 2, 2]], source: 0, destination: 2, k: 1 })
  const pyLines = python.trim().split('\n').length
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(f.pythonLine >= 1 && f.pythonLine <= pyLines)
    assert.equal(f.table.length, 3)
  }
  assert.equal(frames.at(-1).phase, 'done')
})

// Independent oracle: enumerate every simple path (nonnegative weights make walks no better),
// then make the k heaviest edges of that path free.
function oracle(n, edges, source, destination, k) {
  let best = Infinity
  const visit = (node, used, weights) => {
    if (node === destination) {
      const sorted = [...weights].sort((a, b) => b - a)
      const cost = weights.reduce((s, w) => s + w, 0) - sorted.slice(0, k).reduce((s, w) => s + w, 0)
      best = Math.min(best, cost)
    }
    for (const [a, b, w] of edges) {
      if (a !== node || used.has(b)) continue
      used.add(b)
      visit(b, used, [...weights, w])
      used.delete(b)
    }
  }
  visit(source, new Set([source]), [])
  return best === Infinity ? -1 : best
}

test('2714 random graphs match a path-enumeration oracle', () => {
  let seed = 2714
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const edges = Array.from({ length: rnd(10) }, () => [rnd(n), rnd(n), rnd(10)])
    const source = rnd(n)
    const destination = rnd(n)
    const k = rnd(4)
    const input = { n, edges, source, destination, k }
    assert.equal(solve(n, edges, source, destination, k), oracle(n, edges, source, destination, k), JSON.stringify(input))
  }
})
