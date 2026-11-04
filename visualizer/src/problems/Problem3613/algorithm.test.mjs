import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases, examples } from './algorithm.js'

const solve = (n, edges, k) => buildTrace({ n, edges, k }).result

test('3613 hand-computed cases', () => {
  // Keep 1, 2 (3 is redundant), 4, 5; six nodes then form {0,1,2} and {3,4,5}.
  assert.equal(solve(6, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 6], [3, 4, 4], [4, 5, 5]], 2), 5)
  assert.equal(solve(4, [[0, 1, 6], [0, 2, 6], [0, 3, 2]], 1), 6)
  assert.equal(solve(3, [[0, 1, 8], [1, 2, 3]], 3), 0)
  assert.equal(solve(1, [], 1), 0)
  assert.equal(solve(2, [[0, 1, 1000000]], 1), 1000000)
  assert.equal(solve(2, [[0, 1, 9]], 2), 0)
  assert.equal(solve(3, [[0, 1, 4], [0, 1, 2], [1, 2, 7]], 2), 2)
})

// Oracle: try every subset of edges to keep, straight from the definition of cost.
function oracle(n, edges, k) {
  let best = Infinity
  for (let mask = 0; mask < (1 << edges.length); mask++) {
    const parent = Array.from({ length: n }, (_, i) => i)
    const root = x => (parent[x] === x ? x : root(parent[x]))
    let most = 0
    edges.forEach(([u, v, w], index) => {
      if (mask >> index & 1) {
        parent[root(u)] = root(v)
        most = Math.max(most, w)
      }
    })
    if (new Set(parent.map((_, i) => root(i))).size <= k) best = Math.min(best, most)
  }
  return best
}

test('3613 matches every-subset search on random connected graphs', () => {
  let seed = 36
  const next = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let round = 0; round < 300; round++) {
    const n = 1 + next(7)
    const edges = []
    for (let v = 1; v < n; v++) edges.push([next(v), v, 1 + next(9)])
    const extra = next(4)
    if (n > 1) for (let i = 0; i < extra; i++) {
      const u = next(n), v = next(n)
      if (u !== v) edges.push([u, v, 1 + next(9)])
    }
    for (let k = 1; k <= n; k++) assert.equal(solve(n, edges, k), oracle(n, edges, k), JSON.stringify({ n, edges, k }))
  }
})

test('3613 parseInput rejects bad graphs', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1,2]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,2]],"k":3}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,5,2]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,1,0]],"k":1}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[0,0,2],[0,1,1]],"k":1}'))
})

test('3613 frames are complete and the count only falls', () => {
  const ids = new Set(phases.map(phase => phase.id))
  const pyCount = python.trim().split('\n').length
  for (const { input } of examples) {
    const parsed = parseInput(input)
    const { frames, result } = buildTrace(parsed)
    let last = Infinity
    for (const frame of frames) {
      assert.ok(ids.has(frame.phase))
      assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
      assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
      assert.ok(frame.message.length > 0)
      assert.ok(frame.count <= last)
      last = frame.count
      assert.ok(frame.wgraph && frame.dsu)
      assert.equal(frame.components.length, frame.count)
    }
    const merges = frames.filter(frame => frame.phase === 'merge')
    for (const frame of merges) assert.ok(frame.dsu.ops.some(op => op.type === 'union' && op.merged))
    const end = frames.at(-1)
    assert.ok(end.count <= parsed.k)
    assert.equal(end.answer, result)
    assert.equal(Math.max(...end.components.map(component => component.cost)), result)
    assert.ok(end.ledger.every(entry => entry.status !== 'waiting' && entry.status !== 'active'))
  }
})
