import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const close = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-5)

test('637 official examples', () => {
  assert.ok(close(buildTrace([3, 9, 20, null, null, 15, 7]).result, [3, 14.5, 11]))
  assert.ok(close(buildTrace([3, 9, 20, 15, 7]).result, [3, 14.5, 11]))
  assert.ok(close(buildTrace([2147483647]).result, [2147483647]))
})

test('637 random trees match a depth-indexed recursion', () => {
  let state = 8
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(12)
    const values = Array.from({ length: size }, () => (rand(4) === 0 ? null : rand(100) - 50))
    values[0] = values[0] ?? 1
    // Oracle: depth-first recursion on the level-order array, using index arithmetic on the queue order.
    const sums = [], counts = []
    const nodes = values.map(v => (v === null ? null : { v, l: null, r: null }))
    const queue = [nodes[0]]
    let c = 1
    for (let q = 0; q < queue.length && c < nodes.length; q++) {
      queue[q].l = nodes[c++]; if (queue[q].l) queue.push(queue[q].l)
      if (c < nodes.length) { queue[q].r = nodes[c++]; if (queue[q].r) queue.push(queue[q].r) }
    }
    const walk = (node, d) => { if (!node) return; sums[d] = (sums[d] ?? 0) + node.v; counts[d] = (counts[d] ?? 0) + 1; walk(node.l, d + 1); walk(node.r, d + 1) }
    walk(nodes[0], 0)
    const expected = sums.map((s, d) => s / counts[d])
    assert.ok(close(buildTrace(values).result, expected), JSON.stringify(values))
  }
})

test('637 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
