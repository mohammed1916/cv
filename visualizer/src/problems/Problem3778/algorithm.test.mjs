import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (n, edges) => buildTrace({ n, edges }).result

function assertFrames(run) {
  const pyLines = python.split('\n').length
  assert.ok(run.frames.length > 0)
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, `activeLine in ${f.phase}`)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, `pythonLine in ${f.phase}`)
    assert.ok(f.message.length > 0)
  }
}

// Independent oracle: enumerate simple paths from 0 to n-1 and price each as sum minus its maximum edge.
function oracle(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]) }
  let best = Infinity
  const seen = Array(n).fill(false)
  const dfs = (u, sum, mx) => {
    if (u === n - 1) { best = Math.min(best, sum - mx); return }
    for (const [v, w] of adj[u]) {
      if (seen[v]) continue
      seen[v] = true
      dfs(v, sum + w, Math.max(mx, w))
      seen[v] = false
    }
  }
  seen[0] = true
  dfs(0, 0, 0)
  return best
}

test('3778 worked case', () => {
  assert.equal(solve(4, [[0, 1, 4], [1, 3, 2], [0, 2, 1], [2, 3, 7]]), 1)
})

test('3778 two nodes cost nothing once the only edge is waived', () => {
  assert.equal(solve(2, [[0, 1, 9]]), 0)
})

test('3778 frames carry valid pseudocode and python lines', () => {
  assertFrames(buildTrace({ n: 4, edges: [[0, 1, 4], [1, 3, 2], [0, 2, 1], [2, 3, 7]] }))
})

test('3778 parseInput rejects disconnected and repeated edges', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,2],[0,1,3]]}'))
  assert.throws(() => parseInput('{"n":4,"edges":[[0,1,2],[2,3,1],[2,3,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,2]]}'))
})

test('3778 random connected graphs match the simple-path oracle', () => {
  let seed = 3778
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const edges = []
    const has = new Set()
    const add = (u, v) => {
      const key = u < v ? `${u},${v}` : `${v},${u}`
      if (u === v || has.has(key)) return
      has.add(key)
      edges.push([u, v, 1 + rnd(9)])
    }
    for (let i = 1; i < n; i++) add(i, rnd(i))
    for (let extra = rnd(4); extra > 0; extra--) add(rnd(n), rnd(n))
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
