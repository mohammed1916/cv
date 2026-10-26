import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Oracle: Floyd-Warshall distances, then try every visiting order of the nodes.
function oracle(g) {
  const n = g.length, INF = 1e9
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF)))
  g.forEach((ns, i) => ns.forEach(j => { d[i][j] = 1 }))
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j])
  let best = INF
  const used = new Array(n).fill(false)
  const rec = (last, cnt, cost) => {
    if (cnt === n) { best = Math.min(best, cost); return }
    for (let v = 0; v < n; v++) if (!used[v]) { used[v] = true; rec(v, cnt + 1, cost + d[last][v]); used[v] = false }
  }
  for (let s = 0; s < n; s++) { used[s] = true; rec(s, 1, 0); used[s] = false }
  return best
}
test('official examples', () => {
  assert.equal(buildTrace([[1, 2, 3], [0], [0], [0]]).result, 4)
  assert.equal(buildTrace([[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]).result, 4)
  assert.equal(buildTrace([[]]).result, 0)
})
test('random connected graphs match permutation oracle', () => {
  let seed = 13
  const rnd = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(7)
    const adj = Array.from({ length: n }, () => new Set())
    for (let v = 1; v < n; v++) { const u = rnd(v); adj[u].add(v); adj[v].add(u) }
    for (let e = 0; e < rnd(5); e++) { const a = rnd(n), b = rnd(n); if (a !== b) { adj[a].add(b); adj[b].add(a) } }
    const g = adj.map(s => [...s])
    const parsed = parseInput(JSON.stringify(g))
    const tr = buildTrace(parsed)
    assert.equal(tr.result, oracle(g), JSON.stringify(g))
    assert.equal(tr.frames[0].phase, 'start'); assert.equal(tr.frames.at(-1).phase, 'done')
  }
})
test('rejects invalid input', () => {
  assert.throws(() => parseInput('[[1],[]]')); assert.throws(() => parseInput('[[],[]]')); assert.throws(() => parseInput('[[0]]')); assert.throws(() => parseInput('[]'))
})
