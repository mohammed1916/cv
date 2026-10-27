import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2440 official examples', () => {
  assert.equal(solve({ nums: [6, 2, 2, 2, 6], edges: [[0, 1], [1, 2], [1, 3], [3, 4]] }), 2)
  assert.equal(solve({ nums: [2], edges: [] }), 0)
})

test('2440 two equal halves delete their single edge', () => {
  assert.equal(solve({ nums: [3, 3], edges: [[0, 1]] }), 1)
  // Sum 9 splits into three parts of 3 along the path, so two edges go.
  assert.equal(solve({ nums: [3, 3, 3], edges: [[0, 1], [1, 2]] }), 2)
})

test('2440 rejects a zero value and a non-tree', () => {
  assert.throws(() => parseInput(JSON.stringify({ nums: [0, 1], edges: [[0, 1]] })))
  assert.throws(() => parseInput(JSON.stringify({ nums: [1, 1, 1], edges: [[0, 1], [1, 0]] })))
})

// Independent oracle: try every subset of edges to delete, check that all remaining
// components have equal sums, and keep the largest subset that works.
function oracle({ nums, edges }) {
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const parent = Array.from({ length: n }, (_, i) => i)
    const find = v => (parent[v] === v ? v : find(parent[v]))
    let deleted = 0
    edges.forEach(([a, b], i) => {
      if (mask & (1 << i)) deleted++
      else parent[find(a)] = find(b)
    })
    const sums = new Map()
    nums.forEach((v, i) => sums.set(find(i), (sums.get(find(i)) ?? 0) + v))
    const values = [...sums.values()]
    if (values.every(s => s === values[0]) && deleted > best) best = deleted
  }
  return best
}

test('2440 random trees match a try-every-edge-subset oracle', () => {
  let seed = 2440
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(7)
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    const nums = Array.from({ length: n }, () => 1 + rnd(4))
    const input = { nums, edges }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
