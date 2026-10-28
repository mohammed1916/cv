import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2658 official examples', () => {
  assert.equal(solve([[0, 2, 1, 0], [4, 0, 0, 3], [1, 0, 0, 4], [0, 3, 2, 0]]), 7)
  assert.equal(solve([[1, 0], [0, 1]]), 1)
})

test('2658 a grid with no water gives zero', () => {
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('2658 diagonal neighbors are not connected', () => {
  // Water at (0,0) and (1,1) touches only diagonally, so the richer single cell wins.
  assert.equal(solve([[5, 0], [0, 7]]), 7)
})

test('2658 rejects fish counts outside 0 to 10', () => {
  assert.throws(() => parseInput('{"grid":[[11]]}'))
})

// Independent oracle: union-find over adjacent water cells, then sum fish per root.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const parent = Array.from({ length: rows * cols }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const join = (a, b) => { parent[find(a)] = find(b) }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) continue
      if (r + 1 < rows && grid[r + 1][c] > 0) join(r * cols + c, (r + 1) * cols + c)
      if (c + 1 < cols && grid[r][c + 1] > 0) join(r * cols + c, r * cols + c + 1)
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
  return Math.max(0, ...totals.values())
}

test('2658 seeded random grids match the union-find oracle', () => {
  let seed = 2658
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(7)
    const n = 1 + rnd(7)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 0 : 1 + rnd(10))))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
