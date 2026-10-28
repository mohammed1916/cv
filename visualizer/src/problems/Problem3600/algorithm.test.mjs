import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, edges, k) => buildTrace(parseInput(JSON.stringify({ n, edges, k }))).result

test('3600 official examples', () => {
  assert.equal(solve(3, [[0, 1, 2, 1], [1, 2, 3, 0]], 1), 2)
  assert.equal(solve(3, [[0, 1, 4, 0], [1, 2, 3, 0], [0, 2, 1, 0]], 2), 6)
  assert.equal(solve(3, [[0, 1, 1, 1], [1, 2, 1, 1], [2, 0, 1, 1]], 0), -1)
})

test('3600 an upgrade can lift a weak optional edge', () => {
  assert.equal(solve(2, [[0, 1, 3, 0]], 1), 6)
  assert.equal(solve(2, [[0, 1, 3, 0]], 0), 3)
})

test('3600 rejects a duplicate edge', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,2,0],[1,0,3,0]],"k":1}'))
})

// Independent oracle: enumerate every edge subset that is a spanning tree containing the mandatory edges,
// then every upgrade choice within the budget, and keep the best minimum strength.
function oracle(n, edges, k) {
  const m = edges.length
  let best = -1
  for (let mask = 0; mask < 1 << m; mask++) {
    const chosen = edges.filter((_, i) => (mask >> i) & 1)
    if (chosen.length !== n - 1) continue
    if (edges.some((e, i) => e[3] === 1 && !((mask >> i) & 1))) continue
    const parent = Array.from({ length: n }, (_, i) => i)
    const root = x => (parent[x] === x ? x : root(parent[x]))
    let acyclic = true
    for (const [u, v] of chosen) {
      const a = root(u)
      const b = root(v)
      if (a === b) { acyclic = false; break }
      parent[a] = b
    }
    if (!acyclic) continue
    const optional = chosen.map((e, i) => ({ e, i })).filter(x => x.e[3] === 0)
    for (let up = 0; up < 1 << optional.length; up++) {
      let count = 0
      for (let j = 0; j < optional.length; j++) if ((up >> j) & 1) count++
      if (count > k) continue
      const strengths = chosen.map(e => {
        const idx = optional.findIndex(x => x.e === e)
        const upgraded = idx >= 0 && ((up >> idx) & 1)
        return upgraded ? 2 * e[2] : e[2]
      })
      best = Math.max(best, Math.min(...strengths))
    }
  }
  return best
}

test('3600 small random graphs match a tree-and-upgrade enumeration oracle', () => {
  let seed = 3600
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 150; trial++) {
    const n = 2 + rnd(3)
    const pairs = []
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) pairs.push([u, v])
    const picked = pairs.filter(() => rnd(3) > 0)
    if (picked.length === 0) continue
    const edges = picked.map(([u, v]) => [u, v, 1 + rnd(6), rnd(4) === 0 ? 1 : 0])
    const k = rnd(n + 1)
    assert.equal(solve(n, edges, k), oracle(n, edges, k), JSON.stringify({ n, edges, k }))
  }
})
