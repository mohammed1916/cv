import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, row, col, color) => buildTrace(parseInput(JSON.stringify({ grid, row, col, color }))).result

test('1034 official examples', () => {
  assert.deepEqual(solve([[1, 1], [1, 2]], 0, 0, 3), [[3, 3], [3, 2]])
  assert.deepEqual(solve([[1, 2, 2], [2, 3, 2]], 0, 1, 3), [[1, 3, 3], [2, 3, 3]])
  assert.deepEqual(solve([[1, 1, 1], [1, 1, 1], [1, 1, 1]], 1, 1, 2), [[2, 2, 2], [2, 1, 2], [2, 2, 2]])
})

test('1034 a single cell is always a border', () => {
  assert.deepEqual(solve([[0, 1], [1, 1]], 0, 0, 2), [[2, 1], [1, 1]])
})

test('1034 rejects a start outside the grid', () => {
  assert.throws(() => parseInput('{"grid":[[1]],"row":1,"col":0,"color":2}'))
})

// Independent oracle: union-find over equal neighbours. A cell of the component is on the border when a neighbour is
// outside the grid or has a different root (a different component).
function oracle(grid, row, col, color) {
  const R = grid.length
  const C = grid[0].length
  const parent = Array.from({ length: R * C }, (_, k) => k)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const id = (r, c) => r * C + c
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (r + 1 < R && grid[r + 1][c] === grid[r][c]) parent[find(id(r, c))] = find(id(r + 1, c))
      if (c + 1 < C && grid[r][c + 1] === grid[r][c]) parent[find(id(r, c))] = find(id(r, c + 1))
    }
  }
  const root = find(id(row, col))
  const out = grid.map(line => [...line])
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (find(id(r, c)) !== root) continue
      const nbrs = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]
      const edge = nbrs.some(([x, y]) => x < 0 || y < 0 || x >= R || y >= C || find(id(x, y)) !== root)
      if (edge) out[r][c] = color
    }
  }
  return out
}

test('1034 random grids match a union-find oracle', () => {
  let seed = 1034
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const R = 1 + rnd(5)
    const C = 1 + rnd(5)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => rnd(3)))
    const row = rnd(R)
    const col = rnd(C)
    const color = rnd(5)
    assert.deepEqual(solve(grid, row, col, color), oracle(grid, row, col, color), JSON.stringify({ grid, row, col, color }))
  }
})
