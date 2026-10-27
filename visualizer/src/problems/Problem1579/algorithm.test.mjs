import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result

test('1579 official examples', () => {
  assert.equal(solve(4, [[3, 1, 2], [3, 2, 3], [1, 1, 3], [1, 2, 4], [1, 1, 2], [2, 3, 4]]), 2)
  assert.equal(solve(4, [[3, 1, 2], [3, 2, 3], [1, 1, 4], [2, 1, 4]]), 0)
  assert.equal(solve(4, [[3, 2, 3], [1, 1, 2], [2, 3, 4]]), -1)
})

test('1579 a shared edge serves both people', () => {
  assert.equal(solve(2, [[3, 1, 2], [3, 1, 2]]), 1)
})

test('1579 rejects an edge with equal endpoints', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[1,2,2]]}'))
})

// Independent oracle: try every subset of edges, keep the smallest one that still connects Alice and Bob.
function connected(n, edges, types) {
  const p = Array.from({ length: n + 1 }, (_, i) => i)
  const find = x => { while (p[x] !== x) x = p[x]; return x }
  let groups = n
  for (const [t, u, v] of edges) {
    if (!types.includes(t)) continue
    const ru = find(u)
    const rv = find(v)
    if (ru !== rv) { p[ru] = rv; groups-- }
  }
  return groups === 1
}

function oracle(n, edges) {
  let best = -1
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const kept = edges.filter((_, i) => mask & (1 << i))
    if (!connected(n, kept, [1, 3]) || !connected(n, kept, [2, 3])) continue
    if (best === -1 || kept.length < best) best = kept.length
  }
  return best === -1 ? -1 : edges.length - best
}

test('1579 random graphs match a subset oracle', () => {
  let seed = 1579
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(4)
    const edges = Array.from({ length: 1 + rnd(7) }, () => {
      const u = 1 + rnd(n)
      let v = 1 + rnd(n)
      while (v === u) v = 1 + rnd(n)
      return [1 + rnd(3), u, v]
    })
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
