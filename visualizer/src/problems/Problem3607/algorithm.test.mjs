import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (c, connections, queries) => buildTrace({ c, connections, queries }).result

test('3607 hand-computed cases', () => {
  // Grids {2,5,7}, {1,3}, {4,6}.
  assert.deepEqual(solve(7, [[2, 5], [5, 7], [1, 3], [4, 6]],
    [[1, 5], [2, 2], [1, 2], [2, 5], [2, 7], [1, 7], [1, 1], [2, 3], [1, 3], [2, 1], [1, 3]]), [5, 5, -1, 1, 1, -1])
  assert.deepEqual(solve(4, [], [[2, 2], [2, 2], [1, 2], [1, 4]]), [-1, 4])
  assert.deepEqual(solve(5, [[1, 2], [2, 3], [3, 1], [4, 5]], [[2, 1], [2, 2], [1, 3], [1, 1], [2, 3], [1, 2], [1, 4]]), [3, 3, -1, 4])
  assert.deepEqual(solve(1, [], [[2, 1]]), [])
})

// An online station answers itself even when a smaller one is running.
test('3607 a running station never defers to a smaller one', () => {
  assert.deepEqual(solve(3, [[1, 2], [2, 3]], [[1, 3], [2, 3], [1, 3]]), [3, 1])
})

// Independent oracle: flood fill the grid on each check, then scan for the smallest running station.
function oracle(c, connections, queries) {
  const adjacent = Array.from({ length: c + 1 }, () => [])
  for (const [u, v] of connections) { adjacent[u].push(v); adjacent[v].push(u) }
  const running = new Array(c + 1).fill(true)
  const out = []
  for (const [kind, x] of queries) {
    if (kind === 2) { running[x] = false; continue }
    if (running[x]) { out.push(x); continue }
    const seen = new Set([x])
    const pending = [x]
    while (pending.length) for (const next of adjacent[pending.pop()]) if (!seen.has(next)) { seen.add(next); pending.push(next) }
    const alive = [...seen].filter(s => running[s])
    out.push(alive.length ? Math.min(...alive) : -1)
  }
  return out
}

test('3607 random inputs match the flood-fill oracle', () => {
  let seed = 3607
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 800; t++) {
    const c = 1 + rnd(16)
    const connections = []
    if (c > 1) for (let i = rnd(14); i > 0; i--) {
      const u = 1 + rnd(c)
      let v = 1 + rnd(c)
      if (v === u) v = u % c + 1
      connections.push([u, v])
    }
    const queries = Array.from({ length: 1 + rnd(20) }, () => [1 + rnd(2), 1 + rnd(c)])
    assert.deepEqual(solve(c, connections, queries), oracle(c, connections, queries), JSON.stringify({ c, connections, queries }))
  }
})

test('3607 frames keep lists sorted and pointers one-way', () => {
  const { frames, result } = buildTrace({ c: 7, connections: [[2, 5], [5, 7], [1, 3], [4, 6]], queries: [[2, 2], [2, 5], [1, 2], [2, 7], [1, 5]] })
  const lines = python.trim().split('\n').length
  const previous = {}
  for (const f of frames) {
    assert.ok(f.activeLine >= 1 && f.pythonLine >= 1 && f.pythonLine <= lines)
    assert.ok(f.message.length > 0)
    for (const grid of f.members) assert.deepEqual(grid.ids, [...grid.ids].sort((a, b) => a - b))
    for (const [root, value] of Object.entries(f.front)) {
      assert.ok(value >= (previous[root] ?? 0))
      previous[root] = value
    }
  }
  assert.deepEqual(result, [7, -1])
  assert.deepEqual(frames.at(-1).answers, result)
  assert.equal(frames.filter(f => f.phase === 'advance').length, 3)
  const last = frames.at(-1)
  assert.deepEqual(last.members.map(g => g.ids.length).sort(), [2, 2, 3])
})

test('3607 grid membership never changes during queries', () => {
  const { frames } = buildTrace({ c: 4, connections: [[1, 2], [3, 4]], queries: [[2, 1], [2, 2], [1, 1]] })
  const queryFrames = frames.filter(f => f.queryIndex >= 0)
  const shape = f => JSON.stringify(f.gridOf)
  for (const f of queryFrames) assert.equal(shape(f), shape(queryFrames[0]))
})

test('3607 union ops carry every field the shared view reads', () => {
  const { frames } = buildTrace({ c: 3, connections: [[1, 2], [2, 3], [1, 3]], queries: [[1, 1]] })
  const unions = frames.filter(f => f.phase === 'union').map(f => f.ops.at(-1))
  assert.equal(unions[0].merged, true)
  assert.equal(unions[1].winnerSize, 2)
  assert.equal(unions[1].loserSize, 1)
  assert.equal(unions[2].merged, false)
})

test('3607 parseInput enforces the rules', () => {
  assert.equal(parseInput('{"c":2,"connections":[[1,2]],"queries":[[1,1]]}').c, 2)
  for (const bad of [
    '{"c":0,"connections":[],"queries":[[1,1]]}',
    '{"c":2,"connections":[[1,1]],"queries":[[1,1]]}',
    '{"c":2,"connections":[[1,3]],"queries":[[1,1]]}',
    '{"c":2,"connections":[],"queries":[]}',
    '{"c":2,"connections":[],"queries":[[3,1]]}',
    '{"c":2,"connections":[],"queries":[[1,5]]}',
  ]) assert.throws(() => parseInput(bad), bad)
})
