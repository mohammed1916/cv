import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3619 worked examples', () => {
  // Islands {1} and {2}: only the island totalling 2 is divisible by 2.
  assert.equal(solve([[1, 0], [0, 2]], 2), 1)
  // One island of total 6 (cells 1, 2, 3) is divisible by 3; the isolated 4 and 5 are not.
  assert.equal(solve([[1, 2, 0], [0, 3, 0], [4, 0, 5]], 3), 1)
  // A single island totalling 6 is divisible by 3.
  assert.equal(solve([[3, 3], [0, 0]], 3), 1)
})

test('3619 land-only grid has no islands', () => {
  assert.equal(solve([[0, 0], [0, 0]], 5), 0)
})

test('3619 rejects a cell value above 9', () => {
  assert.throws(() => parseInput('{"grid":[[10]],"k":2}'))
})

// Independent oracle: union-find joins touching water cells, then each root's total is checked.
function oracle(grid, k) {
  const rows = grid.length
  const cols = grid[0].length
  const parent = Array.from({ length: rows * cols }, (_, i) => i)
  const find = i => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  const join = (a, b) => { parent[find(a)] = find(b) }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) continue
      if (r + 1 < rows && grid[r + 1][c] !== 0) join(r * cols + c, (r + 1) * cols + c)
      if (c + 1 < cols && grid[r][c + 1] !== 0) join(r * cols + c, r * cols + c + 1)
    }
  }
  const totals = new Map()
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) continue
      const root = find(r * cols + c)
      totals.set(root, (totals.get(root) ?? 0) + grid[r][c])
    }
  }
  return [...totals.values()].filter(t => t % k === 0).length
}

test('3619 random grids match a union-find oracle', () => {
  let seed = 3619
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(3) === 0 ? 0 : rnd(10))))
    const k = 1 + rnd(10)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
