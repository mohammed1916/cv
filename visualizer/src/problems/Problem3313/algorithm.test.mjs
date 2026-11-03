import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

function checkFrames(run) {
  const pyLines = python.split('\n').length
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
    assert.equal(frame.answer.length, run.input.n)
  }
}

// Independent oracle: for each start, run a breadth-first search and collect every farthest node.
function farthestSets(n, edges) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  return Array.from({ length: n }, (_, s) => {
    const dist = Array(n).fill(-1)
    dist[s] = 0
    const q = [s]
    for (let h = 0; h < q.length; h++) for (const v of adj[q[h]]) if (dist[v] < 0) { dist[v] = dist[q[h]] + 1; q.push(v) }
    const far = Math.max(...dist)
    return new Set(dist.map((d, i) => (d === far ? i : -1)).filter(i => i >= 0))
  })
}

test('3313 authored presets return a farthest node for every start', () => {
  const branching = { n: 6, edges: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]] }
  const sets = farthestSets(branching.n, branching.edges)
  solve(branching).forEach((node, i) => assert.ok(sets[i].has(node), `node ${i} answer ${node}`))
  assert.deepEqual(solve({ n: 2, edges: [[1, 0]] }), [1, 0])
  assert.equal(solve({ n: 1, edges: [] }).length, 1)
})

test('3313 a path of four nodes', () => {
  const sets = farthestSets(4, [[0, 1], [1, 2], [2, 3]])
  const result = solve({ n: 4, edges: [[0, 1], [1, 2], [2, 3]] })
  result.forEach((node, i) => assert.ok(sets[i].has(node)))
  assert.deepEqual(result, [3, 3, 0, 0])
})

test('3313 parseInput rejects bad input', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3],[1,2]]}'))
  assert.throws(() => parseInput('[1,2]'))
})

test('3313 random trees match a breadth-first oracle on every start', () => {
  let seed = 3313
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(10)
    const edges = Array.from({ length: n - 1 }, (_, k) => [rnd(k + 1), k + 1])
    const sets = farthestSets(n, edges)
    const result = solve({ n, edges })
    assert.equal(result.length, n)
    result.forEach((node, i) => assert.ok(sets[i].has(node), JSON.stringify({ n, edges, i, node })))
  }
})

test('3313 frames keep pseudocode and python lines valid', () => {
  checkFrames(buildTrace({ n: 6, edges: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]] }))
})
