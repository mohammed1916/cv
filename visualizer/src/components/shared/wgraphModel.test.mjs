import test from 'node:test'
import assert from 'node:assert/strict'
import { describeWeightedOps, distanceRows, layoutCircle, showDistance, wgraphState, WGRAPH_VIEW_LIMIT } from './wgraphModel.js'

test('relaxation sentences name the old and new distance and the reason', () => {
  const [improved, kept, equal] = describeWeightedOps([
    { type: 'relax', u: 0, v: 1, w: 4, base: 0, candidate: 4, old: Infinity, result: 'improved' },
    { type: 'relax', u: 0, v: 2, w: 9, base: 0, candidate: 9, old: 5, result: 'kept' },
    { type: 'relax', u: 1, v: 2, w: 1, base: 4, candidate: 5, old: 5, result: 'equal' },
  ], i => 'ABC'[i])
  assert.match(improved, /goes ∞ → 4/)
  assert.match(kept, /not better than the current distance of C \(5\)/)
  assert.match(equal, /equals the current distance/)
})

test('pop, stale pop, push and MST edge decisions read in plain words', () => {
  const lines = describeWeightedOps([
    { type: 'pop', node: 1, dist: 3 },
    { type: 'stale', node: 2, dist: 9, best: 4 },
    { type: 'push', node: 2, dist: 4 },
    { type: 'edge', u: 0, v: 1, w: 2, decision: 'chosen', reason: 'It joins two separate components.' },
    { type: 'edge', u: 1, v: 2, w: 3, decision: 'rejected', reason: 'Both ends are already connected.' },
  ], String)
  assert.match(lines[0], /smallest value waiting/)
  assert.match(lines[1], /stale/)
  assert.match(lines[2], /Push \(4, 2\)/)
  assert.match(lines[3], /Chosen for the tree/)
  assert.match(lines[4], /Rejected/)
})

test('distance rows flag changed, final and unreached nodes', () => {
  const rows = distanceRows([0, 4, Infinity], [0, Infinity, Infinity], [true, false, false], 1)
  assert.deepEqual(rows.map(r => r.status), ['final', 'tentative', 'unreached'])
  assert.deepEqual(rows.map(r => r.changed), [false, true, false])
  assert.equal(rows[1].active, true)
  assert.equal(showDistance(Infinity), '∞')
})

test('layout places every node inside the box; oversized graphs are not drawn', () => {
  for (const p of layoutCircle(6, 300, 200)) assert.ok(p.x >= 0 && p.x <= 300 && p.y >= 0 && p.y <= 200)
  assert.equal(layoutCircle(1).length, 1)
  const big = wgraphState({ labels: Array.from({ length: WGRAPH_VIEW_LIMIT + 1 }, (_, i) => i), edges: [] })
  assert.deepEqual(big, {})
  const copy = [0, Infinity]
  const small = wgraphState({ labels: ['a', 'b'], edges: [[0, 1, 2]], dist: copy })
  copy[1] = 7
  assert.equal(small.wgraph.dist[1], Infinity)
})
