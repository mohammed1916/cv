import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('3242 worked cases on invented data', () => {
  const grid = [[5, 1, 6], [2, 8, 3], [7, 0, 4]]
  const out = buildTrace({ grid, calls: [['adjacentSum', 8], ['diagonalSum', 3], ['adjacentSum', 5]] })
  assert.deepEqual(out.result, [null, 2 + 1 + 3 + 0, 1 + 0, 2 + 1])
})

// Oracle: scan the whole grid for the neighbour cells instead of using the stored positions.
function oracle(grid, method, value) {
  const n = grid.length
  let r0 = -1, c0 = -1
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === value) { r0 = r; c0 = c } }))
  const deltas = method === 'adjacentSum' ? [[-1, 0], [1, 0], [0, -1], [0, 1]] : [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  let total = 0
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (deltas.some(([dr, dc]) => r0 + dr === r && c0 + dc === c)) total += grid[r][c]
  }
  return total
}

test('3242 matches a full-grid scan on invented grids', () => {
  const grid = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]
  for (let v = 0; v < 16; v++) {
    assert.equal(buildTrace({ grid, calls: [['adjacentSum', v]] }).result[1], oracle(grid, 'adjacentSum', v))
    assert.equal(buildTrace({ grid, calls: [['diagonalSum', v]] }).result[1], oracle(grid, 'diagonalSum', v))
  }
})

test('3242 rejects bad grids and calls', () => {
  assert.throws(() => parseInput('{"grid":[[0,0,1],[2,3,4],[5,6,7]],"calls":[["adjacentSum",0]]}'))
  assert.throws(() => parseInput('{"grid":[[0,1,2],[3,4,5],[6,7,8]],"calls":[["other",0]]}'))
})
