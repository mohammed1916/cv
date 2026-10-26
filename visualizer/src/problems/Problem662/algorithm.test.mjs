import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('662 official examples', () => {
  assert.equal(buildTrace([1, 3, 2, 5, 3, null, 9]).result, 4)
  assert.equal(buildTrace([1, 3, 2, 5, null, null, 9, 6, null, 7]).result, 7)
  assert.equal(buildTrace([1, 3, 2, 5]).result, 2)
  assert.equal(buildTrace([1]).result, 1)
})

// Oracle: depth-first walk recording the leftmost and rightmost heap index per depth.
test('662 random trees match a depth-first leftmost/rightmost oracle', () => {
  let state = 29
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rand(12)
    const values = Array.from({ length: size }, () => (rand(3) === 0 ? null : rand(50)))
    values[0] = values[0] ?? 1
    const nodes = values.map(v => (v === null ? null : { v, l: null, r: null }))
    const queue = [nodes[0]]
    let c = 1
    for (let q = 0; q < queue.length && c < nodes.length; q++) {
      queue[q].l = nodes[c++]; if (queue[q].l) queue.push(queue[q].l)
      if (c < nodes.length) { queue[q].r = nodes[c++]; if (queue[q].r) queue.push(queue[q].r) }
    }
    const extent = new Map()
    const walk = (n, depth, p) => {
      if (!n) return
      const e = extent.get(depth) ?? { lo: p, hi: p }
      extent.set(depth, { lo: Math.min(e.lo, p), hi: Math.max(e.hi, p) })
      walk(n.l, depth + 1, 2 * p)
      walk(n.r, depth + 1, 2 * p + 1)
    }
    walk(nodes[0], 0, 1)
    const expected = Math.max(...[...extent.values()].map(e => e.hi - e.lo + 1))
    assert.equal(buildTrace(values).result, expected, JSON.stringify(values))
  }
})

test('662 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
