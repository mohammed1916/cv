import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function oracle(nums, edges) {
  let count = 0
  for (let mask = 1; mask < 2 ** nums.length; mask++) {
    const selected = nums.map((_, i) => i).filter(i => mask & (1 << i))
    if (selected.reduce((sum, i) => sum + nums[i], 0) % 2) continue
    const parent = nums.map((_, i) => i)
    function root(i) { while (parent[i] !== i) i = parent[i]; return i }
    for (const [u, v] of edges) if (selected.includes(u) && selected.includes(v)) parent[root(u)] = root(v)
    if (selected.every(i => root(i) === root(selected[0]))) count++
  }
  return count
}

test('3910 examples and excluded bridge', () => {
  const run = buildTrace({ nums: [1, 0, 1], edges: [[0, 1], [1, 2]] })
  assert.equal(run.result, 2)
  assert.deepEqual(run.decisions.find(d => d.mask === 5), { mask: 5, sum: 2, connected: false, counted: false })
  assert.equal(buildTrace({ nums: [1], edges: [] }).result, 0)
  assert.equal(buildTrace({ nums: [0], edges: [] }).result, 1)
})

test('3910 all four-node graphs and binary assignments match union-find oracle', () => {
  const possible = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
  for (let graph = 0; graph < 64; graph++) for (let values = 0; values < 16; values++) {
    const nums = Array.from({ length: 4 }, (_, i) => (values >> i) & 1)
    const edges = possible.filter((_, i) => graph & (1 << i))
    const run = buildTrace({ nums, edges })
    assert.equal(run.result, oracle(nums, edges))
    assert.equal(run.decisions.length, 15)
    let total = 0
    for (const frame of run.frames) {
      assert.equal(frame.reached & ~frame.mask, 0)
      if (frame.phase === 'visit') {
        assert.equal(frame.sum % 2, 0)
        assert.ok(frame.reached & (1 << frame.node))
      }
      if (frame.phase === 'decide') {
        if (frame.counted) total++
        assert.equal(frame.connected, frame.sum % 2 ? null : frame.mask === frame.reached)
      }
      assert.equal(frame.total, total)
    }
  }
})

test('3910 full 13-node limit, disconnected graphs, and all-even subsets', () => {
  const nums = Array(13).fill(0), edges = []
  for (let u = 0; u < 13; u++) for (let v = u + 1; v < 13; v++) edges.push([u, v])
  const complete = buildTrace(parseInput(JSON.stringify({ nums, edges })))
  assert.equal(complete.result, 8191)
  assert.equal(complete.decisions.length, 8191)
  assert.equal(complete.frames.filter(f => f.phase === 'visit').length, 13 * 4096)
  assert.equal(buildTrace({ nums, edges: [] }).result, 13)
  assert.equal(buildTrace({ nums: Array(13).fill(1), edges }).result, 4095)
})

test('3910 validates official graph constraints', () => {
  for (const data of [null, {}, { nums: [], edges: [] }, { nums: Array(14).fill(0), edges: [] }, { nums: [2], edges: [] },
    ...[[[0, 0]], [[1, 0]], [[0, 2]], [[0, 1], [0, 1]], [[0.5, 1]], [null]].map(edges => ({ nums: [0, 1], edges }))]) {
    assert.throws(() => parseInput(JSON.stringify(data)))
  }
})
