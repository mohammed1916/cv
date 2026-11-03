import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Build an R by C grid graph with shuffled node ids and edges in random order.
function gridGraph(rows, cols, seed) {
  let s = seed
  const rand = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const ids = Array.from({ length: rows * cols }, (_, i) => i)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]]
  }
  const id = (r, c) => ids[r * cols + c]
  const edges = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (c + 1 < cols) edges.push([id(r, c), id(r, c + 1)])
    if (r + 1 < rows) edges.push([id(r, c), id(r + 1, c)])
  }
  return edges.sort(() => rand() - 0.5)
}

// Oracle: the returned grid must hold every node once and its adjacency must equal the edge set.
function assertGrid(n, edges, grid) {
  const cells = grid.flat()
  assert.equal(cells.length, n)
  assert.deepEqual([...new Set(cells)].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i))
  const at = new Map()
  grid.forEach((row, r) => row.forEach((v, c) => at.set(v, [r, c])))
  const want = new Set(edges.map(([u, v]) => `${Math.min(u, v)},${Math.max(u, v)}`))
  const got = new Set()
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) {
    if (c + 1 < grid[r].length) got.add([grid[r][c], grid[r][c + 1]].sort((a, b) => a - b).join(','))
    if (r + 1 < grid.length) got.add([grid[r][c], grid[r + 1][c]].sort((a, b) => a - b).join(','))
  }
  assert.deepEqual([...got].sort(), [...want].sort())
}

test('3311 worked example shapes lay out as grids', () => {
  const edges = [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4], [2, 5]]
  const result = buildTrace({ n: 6, edges }).result
  assertGrid(6, edges, result)
})

test('3311 random grid graphs are reconstructed', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const rows = 2 + (seed % 4)
    const cols = 2 + (seed % 5)
    const edges = gridGraph(rows, cols, seed)
    const result = buildTrace({ n: rows * cols, edges }).result
    assertGrid(rows * cols, edges, result)
  }
})

test('3311 a single line is one row', () => {
  assert.deepEqual(buildTrace({ n: 3, edges: [[0, 1], [1, 2]] }).result.length, 1)
})

test('3311 rejects malformed input', () => {
  assert.throws(() => parseInput('{"n":1,"edges":[[0,0]]}'))
  assert.throws(() => parseInput('{"n":3,"edges":[[0,3]]}'))
})
