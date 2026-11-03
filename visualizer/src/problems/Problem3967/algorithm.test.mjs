import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (baseTime, edges) => buildTrace(parseInput(JSON.stringify({ baseTime, edges }))).result
const pyLineCount = python.trim().split('\n').length

// Independent oracle: for each root, order nodes by BFS, then finish them in reverse order.
function oracle(baseTime, edges) {
  const n = baseTime.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  let best = Infinity
  for (let root = 0; root < n; root++) {
    const parent = Array(n).fill(-2)
    parent[root] = -1
    const order = [root]
    for (let i = 0; i < order.length; i++) {
      for (const c of adj[order[i]]) if (parent[c] === -2) { parent[c] = order[i]; order.push(c) }
    }
    const finish = Array(n).fill(null)
    for (let i = n - 1; i >= 0; i--) {
      const v = order[i]
      const kids = adj[v].filter(c => c !== parent[v]).map(c => finish[c])
      finish[v] = kids.length === 0 ? baseTime[v] : 2 * Math.max(...kids) - Math.min(...kids) + baseTime[v]
    }
    best = Math.min(best, finish[root])
  }
  return best
}

test('3967 hand-checked values', () => {
  assert.equal(solve([7], []), 7)
  assert.equal(solve([3, 5], [[0, 1]]), 8)
  assert.equal(solve([1, 1, 1], [[0, 1], [1, 2]]), 2)
})

test('3967 rejects bad trees', () => {
  assert.throws(() => parseInput('{"baseTime":[1,2],"edges":[]}'))
  assert.throws(() => parseInput('{"baseTime":[1,2,3],"edges":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"baseTime":[1,2,3],"edges":[[0,1],[1,1]]}'))
  assert.throws(() => parseInput('{"baseTime":[0],"edges":[]}'))
})

test('3967 recursive trace agrees with the BFS-order oracle on random trees', () => {
  let seed = 3967
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const baseTime = Array.from({ length: n }, () => 1 + rnd(9))
    const edges = Array.from({ length: n - 1 }, (_, i) => [rnd(i + 1), i + 1])
    assert.equal(solve(baseTime, edges), oracle(baseTime, edges), JSON.stringify({ baseTime, edges }))
  }
})

test('3967 frame invariants hold', () => {
  const run = buildTrace(parseInput('{"baseTime":[2,4,1,3],"edges":[[0,1],[1,2],[1,3]]}'))
  assert.equal(run.frames[run.frames.length - 1].phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLineCount)
    assert.equal(frame.finished.length, 4)
  }
})
