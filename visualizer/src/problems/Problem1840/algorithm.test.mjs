import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('1840 official examples', () => {
  assert.equal(solve({ n: 5, restrictions: [[2, 1], [4, 1]] }), 2)
  assert.equal(solve({ n: 6, restrictions: [] }), 5)
  assert.equal(solve({ n: 10, restrictions: [[5, 3], [2, 5], [7, 4], [10, 3]] }), 5)
})

test('1840 a single building can only be at height 0 then 1', () => {
  assert.equal(solve({ n: 2, restrictions: [] }), 1)
})

test('1840 rejects a restriction on building 1', () => {
  assert.throws(() => parseInput('{"n":3,"restrictions":[[1,0]]}'))
})

// Independent oracle: for each building and height, check that some valid prefix reaches it from building 1
// and some valid suffix reaches it from building n. Keep the largest height that passes both.
function oracle({ n, restrictions }) {
  const lim = Array(n + 1).fill(Infinity)
  lim[1] = 0
  for (const [id, cap] of restrictions) lim[id] = cap
  const V = 40
  const range = () => Array.from({ length: V + 1 }, () => false)
  const F = []
  const G = []
  F[1] = range().map((_, v) => v === 0)
  for (let i = 2; i <= n; i++) F[i] = range().map((_, v) => v <= lim[i] && (F[i - 1][v] || F[i - 1][v - 1] || F[i - 1][v + 1]))
  G[n] = range().map((_, v) => v <= lim[n])
  for (let i = n - 1; i >= 1; i--) G[i] = range().map((_, v) => v <= lim[i] && (G[i + 1][v] || G[i + 1][v - 1] || G[i + 1][v + 1]))
  let best = 0
  for (let i = 1; i <= n; i++) {
    for (let v = 0; v <= V; v++) if (F[i][v] && G[i][v]) best = Math.max(best, v)
  }
  return best
}

test('1840 random restrictions match a reachable-heights oracle', () => {
  let seed = 1840
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(7)
    const ids = Array.from({ length: n - 1 }, (_, i) => i + 2)
    for (let i = ids.length - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
    }
    const count = rnd(n)
    const restrictions = ids.slice(0, count).map(id => [id, rnd(11)])
    const input = { n, restrictions }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
