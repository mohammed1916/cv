import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = g => buildTrace(parseInput(JSON.stringify(g))).result
// Oracle: repeated sweeps to a fixpoint instead of a queue with degree counters.
function oracle(g) {
  const n = g.length
  const r = [null, ...[1, 2].map(() => Array.from({ length: n }, () => new Array(n).fill(0)))]
  for (let c = 1; c < n; c++) for (const t of [1, 2]) { r[t][0][c] = 1; r[t][c][c] = 2 }
  for (let changed = true; changed;) {
    changed = false
    for (let m = 0; m < n; m++) for (let c = 1; c < n; c++) for (const t of [1, 2]) {
      if (r[t][m][c]) continue
      const outs = t === 1 ? g[m].map(x => r[2][x][c]) : g[c].filter(x => x > 0).map(x => r[1][m][x])
      if (!outs.length) continue
      const mine = t
      let v = 0
      if (outs.includes(mine)) v = mine
      else if (outs.every(o => o === 3 - mine)) v = 3 - mine
      if (v) { r[t][m][c] = v; changed = true }
    }
  }
  return r[1][1][2]
}
test('official examples', () => {
  assert.equal(solve([[2, 5], [3], [0, 4, 5], [1, 4, 5], [2, 3], [0, 2, 3]]), 0)
  assert.equal(solve([[1, 3], [0], [3], [0, 2]]), 1)
})
test('matches fixpoint oracle on random graphs', () => {
  let seed = 17
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  const seen = [0, 0, 0]
  for (let t = 0; t < 600; t++) {
    const n = 3 + rnd(6)
    const adj = Array.from({ length: n }, () => new Set())
    for (let i = 0; i < n; i++) { const j = (i + 1 + rnd(n - 1)) % n; adj[i].add(j); adj[j].add(i) }
    for (let e = rnd(n); e > 0; e--) { const a = rnd(n), b = rnd(n); if (a !== b) { adj[a].add(b); adj[b].add(a) } }
    const g = adj.map(s => [...s].sort((x, y) => x - y))
    const got = solve(g)
    assert.equal(got, oracle(g), JSON.stringify(g))
    seen[got]++
  }
  assert.ok(seen.every(x => x > 0), `all outcomes covered: ${seen}`)
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('[[1,3],[0],[3],[0,2]]')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('[[1],[0]]'))
  assert.throws(() => parseInput('[[1],[0],[]]'))
  assert.throws(() => parseInput('[[1],[2],[0]]'))
})
