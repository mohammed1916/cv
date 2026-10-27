import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, source, destination, target) => buildTrace(parseInput(JSON.stringify({ n, edges, source, destination, target }))).result

// Independent oracle: Floyd-Warshall distance for a concrete edge list.
function floyd(n, edges, s, t) {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [a, b, w] of edges) { d[a][b] = Math.min(d[a][b], w); d[b][a] = Math.min(d[b][a], w) }
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  return d[s][t]
}

// Valid when: fixed edges unchanged, every -1 edge is positive, and the shortest distance is exactly the target.
function valid(n, input, out) {
  if (out.length !== input.edges.length) return false
  for (let i = 0; i < out.length; i++) {
    const [a, b, w] = out[i], [a0, b0, w0] = input.edges[i]
    if (a !== a0 || b !== b0) return false
    if (w0 !== -1 && w !== w0) return false
    if (w0 === -1 && (w < 1 || w > 2000000000)) return false
  }
  return floyd(n, out, input.source, input.destination) === input.target
}

test('2699 a single unknown edge is set to the exact target', () => {
  const out = solve(2, [[0, 1, -1]], 0, 1, 5)
  assert.deepEqual(out, [[0, 1, 5]])
})

test('2699 a fixed route already shorter than the target is impossible', () => {
  assert.deepEqual(solve(3, [[0, 1, 1], [1, 2, 1], [0, 2, -1]], 0, 2, 3), [])
})

test('2699 a fixed route longer than the target is shortened by an unknown edge', () => {
  assert.deepEqual(solve(3, [[0, 1, 4], [1, 2, 3], [0, 2, -1]], 0, 2, 6), [[0, 1, 4], [1, 2, 3], [0, 2, 6]])
  assert.deepEqual(solve(3, [[0, 1, 4], [1, 2, 3], [0, 2, -1]], 0, 2, 3), [[0, 1, 4], [1, 2, 3], [0, 2, 3]])
})

test('2699 two unknown edges on the only route need at least two', () => {
  assert.deepEqual(solve(3, [[0, 1, -1], [1, 2, -1]], 0, 2, 1), [])
  assert.deepEqual(solve(3, [[0, 1, -1], [1, 2, -1]], 0, 2, 2), [[0, 1, 1], [1, 2, 1]])
})

test('2699 valid outputs have the exact target distance', () => {
  const input = { n: 4, edges: [[0, 1, -1], [1, 2, -1], [2, 3, 1], [0, 3, -1]], source: 0, destination: 3, target: 6 }
  const out = solve(input.n, input.edges, input.source, input.destination, input.target)
  assert.ok(valid(input.n, input, out))
})

test('2699 rejects a weight of zero in the input', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,0]],"source":0,"destination":1,"target":3}'))
})

// Independent oracle: enumerate every assignment of the unknown weights from 1 to target + 1 (target + 1 acts as "unusable").
function exists(n, edges, source, destination, target) {
  const unknown = edges.map((e, i) => i).filter(i => edges[i][2] === -1)
  const choices = Array.from({ length: target + 1 }, (_, k) => k + 1)
  const assign = (pos, current) => {
    if (pos === unknown.length) return floyd(n, current, source, destination) === target
    for (const w of choices) {
      const next = current.map(e => [...e])
      next[unknown[pos]][2] = w
      if (assign(pos + 1, next)) return true
    }
    return false
  }
  return assign(0, edges.map(e => [...e]))
}

test('2699 random instances: a result exists exactly when the exhaustive search finds one, and any result is valid', () => {
  let seed = 2699
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 150; t++) {
    const n = 2 + rnd(4)
    const edges = []
    const pairs = new Set()
    for (let e = 0; e < 1 + rnd(5); e++) {
      const a = rnd(n), b = rnd(n)
      if (a === b) continue
      const key = a < b ? `${a},${b}` : `${b},${a}`
      if (pairs.has(key)) continue
      pairs.add(key)
      edges.push([a, b, rnd(3) === 0 ? 1 + rnd(4) : -1])
    }
    if (edges.length === 0) continue
    const unknownCount = edges.filter(e => e[2] === -1).length
    if (unknownCount > 3) continue
    const source = rnd(n), destination = rnd(n)
    if (source === destination) continue
    const target = 1 + rnd(6)
    const input = { n, edges, source, destination, target }
    const out = solve(n, edges, source, destination, target)
    const found = exists(n, edges, source, destination, target)
    assert.equal(out.length > 0, found, JSON.stringify(input))
    if (out.length > 0) assert.ok(valid(n, input, out), JSON.stringify({ input, out }))
  }
})
