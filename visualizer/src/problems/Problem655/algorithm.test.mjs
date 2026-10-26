import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('655 official examples', () => {
  assert.deepEqual(buildTrace([1, 2]).result, [['', '1', ''], ['2', '', '']])
  assert.deepEqual(buildTrace([1, 2, 3, null, 4]).result, [
    ['', '', '', '1', '', '', ''],
    ['', '2', '', '', '', '3', ''],
    ['', '', '4', '', '', '', ''],
  ])
})

// Oracle: heap positions. Node at depth d with heap index p (root 1) sits in column (2·(p − 2^d) + 1)·2^(H−d) − 1.
test('655 random trees place each value at its heap-position column', () => {
  let state = 3
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 200; t++) {
    const size = 1 + rand(10)
    const values = Array.from({ length: size }, () => (rand(3) === 0 ? null : rand(50)))
    values[0] = values[0] ?? 1
    const grid = buildTrace(values).result
    const H = grid.length - 1
    const nodes = values.map(v => (v === null ? null : { v, p: 0 }))
    const placed = []
    const queue = [{ node: nodes[0], p: 1, d: 0 }]
    let c = 1
    for (let q = 0; q < queue.length; q++) {
      const { node, p, d } = queue[q]
      placed.push({ value: String(node.v), row: d, col: (2 * (p - 2 ** d) + 1) * 2 ** (H - d) - 1 })
      if (c < nodes.length) { const l = nodes[c++]; if (l) queue.push({ node: l, p: 2 * p, d: d + 1 }) }
      if (c < nodes.length) { const r = nodes[c++]; if (r) queue.push({ node: r, p: 2 * p + 1, d: d + 1 }) }
    }
    for (const { value, row, col } of placed) assert.equal(grid[row][col], value, JSON.stringify(values))
    assert.equal(grid.flat().filter(x => x !== '').length, placed.length, JSON.stringify(values))
  }
})

test('655 rejects a null root', () => {
  assert.throws(() => parseInput('[null]'))
})
